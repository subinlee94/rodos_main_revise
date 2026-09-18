plugins {
	java
	id("org.springframework.boot") version "3.4.5"
	id("io.spring.dependency-management") version "1.1.7"
}

group = "com.java.kr.ac.kangwon"
version = "0.0.1-SNAPSHOT"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(17)
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-web")
	implementation("com.fasterxml.jackson.core:jackson-databind")
	implementation("com.fasterxml.jackson.module:jackson-module-jsonSchema")
	implementation("com.fasterxml.jackson.dataformat:jackson-dataformat-xml")
	
	// Retrofit for HTTP client
	implementation("com.squareup.retrofit2:retrofit:2.9.0")
	implementation("com.squareup.retrofit2:converter-gson:2.9.0")
	implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
	
	// Gson for JSON serialization
	implementation("com.google.code.gson:gson:2.10.1")
	
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	developmentOnly("org.springframework.boot:spring-boot-devtools") // Live Reload 기능 활성화
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
	useJUnitPlatform()
}
