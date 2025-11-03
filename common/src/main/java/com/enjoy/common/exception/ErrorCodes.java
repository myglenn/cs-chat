package com.enjoy.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCodes {

    INVALID_ARGUMENT(HttpStatus.BAD_REQUEST, "E001", "잘못된 인자값입니다."),


    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "U001", "사용자를 찾을 수 없습니다. (대상: %s)"),
    DUPLICATE_LOGIN_ID(HttpStatus.BAD_REQUEST, "U002", "이미 사용 중인 아이디입니다."),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "U003", "비밀번호가 일치하지 않습니다."),


    ACCESS_DENIED(HttpStatus.FORBIDDEN, "A001", "해당 리소스에 접근할 권한이 없습니다."),
    ADMIN_NOT_IN_AGENCY(HttpStatus.BAD_REQUEST, "A002", "관리자가 대리점에 소속되어 있지 않습니다."),
    AGENCY_NOT_FOUND(HttpStatus.NOT_FOUND, "G001", "대리점을 찾을 수 없습니다. (ID: %s)"),
    CHANNEL_NOT_FOUND(HttpStatus.NOT_FOUND, "C001", "채널을 찾을 수 없습니다. (ID: %s)"),
    FILE_UPLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "F001", "파일 업로드에 실패했습니다."),
    FILE_NOT_FOUND(HttpStatus.NOT_FOUND, "F002", "파일을 찾을 수 없습니다. (%s)"),
    FILE_STORAGE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "F003", "파일 저장 중 오류가 발생했습니다."),
    FILE_DOWNLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "F004", "파일 다운로드에 실패했습니다."),
    INVALID_FILE_TYPE(HttpStatus.BAD_REQUEST, "F005", "허용되지 않는 파일 형식입니다."),
    FILE_SIZE_EXCEEDED(HttpStatus.BAD_REQUEST, "F006", "파일 크기 제한을 초과했습니다."),
    INVALID_FILE_PATH(HttpStatus.INTERNAL_SERVER_ERROR, "F007", "잘못된 파일 경로입니다.");


    private final HttpStatus status;
    private final String code;
    private final String message;
}
