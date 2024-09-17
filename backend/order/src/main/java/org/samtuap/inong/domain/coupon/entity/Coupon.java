package org.samtuap.inong.domain.coupon.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.samtuap.inong.domain.common.BaseEntity;

import java.time.LocalDateTime;


@Entity
@SQLDelete(sql = "UPDATE coupon SET deleted_at = now() WHERE id = ?")
@SQLRestriction("deleted_at is NULL")
public class Coupon extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private String couponName;

    @NotNull
    private Integer discountPercentage;

    @NotNull
    private LocalDateTime expiration;

}