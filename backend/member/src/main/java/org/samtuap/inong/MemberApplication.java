package org.samtuap.inong;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class MemberApplication {

	public static void main(String[] args) {
		SpringApplication.run(MemberApplication.class, args);
	}

	@PostConstruct
	public void init() {
		// timezone KST로 설정
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));
	}
}