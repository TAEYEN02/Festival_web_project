package com.example.festival.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.xml.MappingJackson2XmlHttpMessageConverter;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

	@Bean
	public RestTemplate restTemplate() {
	    RestTemplate restTemplate = new RestTemplate();
	    // XML 메시지 컨버터 제거
	    restTemplate.getMessageConverters().removeIf(c -> c.getClass().getName().contains("Xml"));
	    return restTemplate;
	}
}