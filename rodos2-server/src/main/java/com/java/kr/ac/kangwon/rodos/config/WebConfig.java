package com.java.kr.ac.kangwon.rodos.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // React 빌드 파일들을 정적 리소스로 등록
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(0) // 개발 중에는 캐시 비활성화
                .resourceChain(true)
                .addResolver(new SpaResourceResolver());
    }

    @Override
    public void addViewControllers(@NonNull ViewControllerRegistry registry) {
        // SPA 라우팅을 위한 fallback 설정
        registry.addViewController("/")
                .setViewName("forward:/index.html");
    }

    /**
     * SPA 리소스 리졸버 - React Router를 위한 fallback 처리
     */
    public static class SpaResourceResolver extends PathResourceResolver {
        @Override
        protected Resource getResource(String resourcePath, Resource location) throws IOException {
            Resource requestedResource = location.createRelative(resourcePath);

            // 요청된 리소스가 존재하면 반환
            if (requestedResource.exists() && requestedResource.isReadable()) {
                return requestedResource;
            }

            // API 경로는 제외
            if (resourcePath.startsWith("api/")) {
                return null;
            }

            // SPA 라우팅을 위해 index.html 반환
            return new ClassPathResource("/static/index.html");
        }
    }
}