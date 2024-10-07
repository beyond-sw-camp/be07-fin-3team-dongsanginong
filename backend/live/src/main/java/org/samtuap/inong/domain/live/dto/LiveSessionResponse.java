package org.samtuap.inong.domain.live.dto;

import io.openvidu.java.client.Session;
import lombok.Builder;
import org.samtuap.inong.domain.live.entity.Live;

@Builder
public record LiveSessionResponse(
        Long liveId,
        String sessionId,
        String title,
        String liveImage,
        boolean isLive
) {
    public static LiveSessionResponse fromEntity(LiveSessionRequest request, Live live, Session session) {
        return LiveSessionResponse.builder()
                .liveId(live.getId())
                .sessionId(session.getSessionId())
                .title(request.title())
                .liveImage(request.liveImage())
                .isLive(true)
                .build();
    }

    public static LiveSessionResponse liveFromEntity(Live live) {
        return LiveSessionResponse.builder()
                .liveId(live.getId())  // liveId
                .sessionId(live.getSessionId())  // sessionId
                .title(live.getTitle())  // Live 엔티티에서 title 가져오기
                .liveImage(live.getLiveImage())  // liveImage 가져오기 (만약 존재한다면)
                .isLive(true)  // 현재 라이브가 진행 중임을 표시
                .build();
    }
}