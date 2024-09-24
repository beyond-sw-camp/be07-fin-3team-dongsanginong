package org.samtuap.inong.domain.review.dto;

import lombok.Builder;
import org.samtuap.inong.domain.review.entity.Review;
import org.samtuap.inong.domain.review.entity.ReviewImage;

import java.util.List;

@Builder
public record ReviewResponse(
        Long id,
        String title,
        Integer rating,
        String contents,
        List<String> imageUrls
) {
    public static ReviewResponse fromEntity(Review review, List<ReviewImage> reviewImages) {

        List<String> imageUrls = reviewImages.stream()
                .map(ReviewImage::getImageUrl) // ReviewImage 엔티티에서 이미지 URL 가져오기
                .toList();

        return ReviewResponse.builder()
                .id(review.getId()) // 엔티티의 ID 가져오기
                .title(review.getTitle())
                .rating(review.getRating())
                .contents(review.getContents())
                .imageUrls(imageUrls)
                .build();
    }
}
