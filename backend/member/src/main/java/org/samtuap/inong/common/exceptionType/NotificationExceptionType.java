package org.samtuap.inong.common.exceptionType;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@RequiredArgsConstructor
public enum NotificationExceptionType implements ExceptionType {

    FCM_TOKEN_NOT_FOUND(HttpStatus.INTERNAL_SERVER_ERROR, "유저의 FCM 토큰이 존재하지 않습니다."),
    FCM_SEND_FAIL(HttpStatus.INTERNAL_SERVER_ERROR, "메시지 전송에 실패했습니다."),
    INVALID_FCM_REQUEST(HttpStatus.BAD_REQUEST, "잘못된 형식의 메시지 요청입니다.");

    private final HttpStatus status;
    private final String message;

    @Override
    public HttpStatus httpStatus() {
        return status;
    }

    @Override
    public String message() {
        return message;
    }
}