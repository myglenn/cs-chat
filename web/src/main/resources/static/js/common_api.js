class ApiClient {
    constructor(baseURL = '/api') {
        this.baseURL = baseURL;
        this.accessToken = null;
        this.stompClient = null;
        this.subscriptions = new Map();

        this.reconnectDelay = 5000;
        this.isConnecting = false;
    }

    setToken(accessToken, rememberMe = false) {
        this.accessToken = accessToken;
        if (rememberMe) {
            localStorage.setItem('accessToken', accessToken);
        } else {
            sessionStorage.setItem('accessToken', accessToken);
        }
    }

    clearToken() {
        this.accessToken = null;
        sessionStorage.removeItem('accessToken');
        localStorage.removeItem('accessToken');
    }

    async get(path) {
        return await this._request('GET', path);
    }

    async post(path, body) {
        return await this._request('POST', path, body);
    }

    async put(path, body) {
        return await this._request('PUT', path, body);
    }

    async delete(path) {
        return await this._request('DELETE', path);
    }

    async _request(method, path, body = null) {
        const url = `${this.baseURL}${path}`;
        const options = {
            method: method,
            headers: {},
            credentials: 'include'
        };
        if (this.accessToken) {
            options.headers['Authorization'] = `Bearer ${this.accessToken}`;
        }
        if (body) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }
        try {
            let response = await fetch(url, options);
            if (response.status === 401) {
                const newAccessToken = await this._refreshTokenAndRetry();
                if (newAccessToken) {
                    options.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    response = await fetch(url, options);
                }
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                return await response.json();
            }
            return;

        } catch (error) {
            console.error('API request failed:', error);


            throw error;
        }
    }

    async _refreshTokenAndRetry() {
        try {
            const response = await fetch('/api/auth/reissue', {method: 'POST', credentials: 'include'});

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }
            const tokenData = await response.json();
            const newAccessToken = tokenData.accessToken;

            this.setToken(newAccessToken);
            return newAccessToken;

        } catch (error) {
            console.error("Could not refresh token (e.g., 7 days expired):", error);
            this.clearToken();
            window.location.href = '/login?session=expired';
            return null;
        }
    }

    async postMultipart(path, formData) {
        const url = `${this.baseURL}${path}`;
        const options = {
            method: 'POST',
            headers: {},
            credentials: 'include'
        };

        if (this.accessToken) {
            options.headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        options.body = formData;

        try {
            let response = await fetch(url, options);
            if (response.status === 401) {
                const newAccessToken = await this._refreshTokenAndRetry();
                if (newAccessToken) {
                    options.headers['Authorization'] = `Bearer ${newAccessToken}`;
                    response = await fetch(url, options);
                } else {
                    throw new Error('Unauthorized after token refresh failed');
                }
            }
            if (!response.ok) {
                let errorBody;
                try {
                    errorBody = await response.json();
                } catch (e) {
                    errorBody = await response.text();
                }
                console.error('Multipart API Error Response:', errorBody);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                return await response.json();
            }
            return await response.text();

        } catch (error) {
            console.error('Multipart API request failed:', error);
            throw error;
        }
    }

    connectWebSocket() {
        return new Promise((resolve, reject) => {
            if (this.stompClient && this.stompClient.connected) {
                resolve();
                return;
            }
            if (this.isConnecting) {
                reject("Already attempting to connect.");
                return;
            }
            this.isConnecting = true;

            const socket = new SockJS("/ws-stomp");
            this.stompClient = Stomp.over(socket);

            this.stompClient.heartbeat.outgoing = 20000;
            this.stompClient.heartbeat.incoming = 20000;

            this.stompClient.debug = null;

            const headers = {};
            if (this.accessToken) {
                headers['Authorization'] = `Bearer ${this.accessToken}`;
            }

            this.stompClient.connect(headers,
                () => { // onConnect (연결 성공)
                    this.isConnecting = false;
                    console.log("WebSocket connected.");
                    this.subscriptions.forEach((subInfo, topic) => {
                        const newSubscription = this.stompClient.subscribe(topic, (message) => {
                            subInfo.callback(JSON.parse(message.body));
                        });
                        subInfo.subscription = newSubscription; // 새 구독 정보로 갱신
                    });

                    resolve();
                },
                (error) => {
                    this.isConnecting = false;
                    console.error("WebSocket connection error, attempting reconnect...", error);

                    setTimeout(() => {
                        this.connectWebSocket();
                    }, this.reconnectDelay);

                    reject(error);
                }
            );
        });
    }

    disconnectWebSocket() {
        if (this.stompClient) {
            this.stompClient.disconnect(() => {
                this.subscriptions.clear();
            });
        }
    }

    subscribe(topic, callback) {
        if (!this.stompClient || !this.stompClient.connected) {
            console.warn("WebSocket not connected. Storing subscription for later.");
            this.subscriptions.set(topic, { subscription: null, callback });
            return;
        }
        if (this.subscriptions.has(topic)) {
            this.subscriptions.get(topic).callback = callback;
            return;
        }

        const subscription = this.stompClient.subscribe(topic, (message) => {
            callback(JSON.parse(message.body));
        });

        this.subscriptions.set(topic, { subscription, callback });
        return topic;
    }

    unsubscribe(topic) {
        if (this.subscriptions.has(topic)) {
            const subInfo = this.subscriptions.get(topic);
            if (subInfo.subscription) {
                subInfo.subscription.unsubscribe();
            }
            this.subscriptions.delete(topic);
        }
    }

    publish(destination, payload) {
        if (!this.stompClient || !this.stompClient.connected) {
            console.error("Connect to WebSocket before publishing.");
            return;
        }
        this.stompClient.send(destination, {}, JSON.stringify(payload));
    }
}