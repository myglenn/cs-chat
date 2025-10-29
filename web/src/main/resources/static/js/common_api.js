class ApiClient {
    constructor(baseURL = '/api') {
        this.baseURL = baseURL;
        this.accessToken = null;
        this.stompClient = null;
        this.subscriptions = new Map();
    }

    setToken(accessToken) {
        this.accessToken = accessToken;
        sessionStorage.setItem('accessToken', accessToken);
    }

    clearToken() {
        this.accessToken = null;
        sessionStorage.removeItem('accessToken');
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
            headers: {}
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
            const response = await fetch('/api/auth/reissue', {method: 'POST'});

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }
            const tokenData = await response.json();
            const newAccessToken = tokenData.accessToken;

            this.setToken(newAccessToken);
            return newAccessToken;

        } catch (error) {
            console.error("Could not refresh token:", error);
            return null;
        }
    }

    async postMultipart(path, formData) {
        const url = `${this.baseURL}${path}`;
        const options = {
            method: 'POST',
            headers: {}
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
                    this.clearToken();
                    window.location.href = '/login';
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
                console.log("Already connected to WebSocket.");
                resolve();
                return;
            }

            const socket = new SockJS("/ws-stomp");
            this.stompClient = Stomp.over(socket);

            const headers = {};
            if (this.accessToken) {
                headers['Authorization'] = `Bearer ${this.accessToken}`;
            }

            this.stompClient.connect(headers, () => {
                console.log("WebSocket connected successfully!");
                resolve();
            }, (error) => {
                console.error("WebSocket connection error:", error);
                reject(error);
            });
        });
    }

    disconnectWebSocket() {
        if (this.stompClient) {
            this.stompClient.disconnect(() => {
                console.log("WebSocket disconnected.");
                this.subscriptions.clear();
            });
        }
    }

    subscribe(topic, callback) {
        if (!this.stompClient || !this.stompClient.connected) {
            console.error("Connect to WebSocket before subscribing.");
            return;
        }

        if (this.subscriptions.has(topic)) {
            console.log(`Already subscribed to ${topic}.`);
            return;
        }

        const subscription = this.stompClient.subscribe(topic, (message) => {
            callback(JSON.parse(message.body));
        });

        this.subscriptions.set(topic, subscription);
        console.log(`Subscribed to ${topic}`);
        return topic;
    }

    unsubscribe(topic) {
        if (this.subscriptions.has(topic)) {
            this.subscriptions.get(topic).unsubscribe();
            this.subscriptions.delete(topic);
            console.log(`Unsubscribed from ${topic}`);
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