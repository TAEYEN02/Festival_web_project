package com.korea.festival.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${app.name:Festival App}")
    private String appName;
    
    /**
     * 임시 비밀번호 이메일 발송
     */
    @Async
    public void sendTempPassword(String toEmail, String username, String tempPassword) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, appName);
            helper.setTo(toEmail);
            helper.setSubject("[" + appName + "] 임시 비밀번호 발송");
            
            String content = buildTempPasswordEmail(username, tempPassword);
            helper.setText(content, true);
            
            mailSender.send(message);
            log.info("임시 비밀번호 이메일 발송 완료: {}", toEmail);
            
        } catch (Exception e) {
            log.error("임시 비밀번호 이메일 발송 실패: {}", toEmail, e);
            throw new RuntimeException("이메일 발송에 실패했습니다");
        }
    }
    
    /**
     * 회원가입 환영 이메일 발송 (선택사항)
     */
    @Async
    public void sendWelcomeEmail(String toEmail, String username) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, appName);
            helper.setTo(toEmail);
            helper.setSubject("[" + appName + "] 회원가입을 환영합니다!");
            
            String content = buildWelcomeEmail(username);
            helper.setText(content, true);
            
            mailSender.send(message);
            log.info("환영 이메일 발송 완료: {}", toEmail);
            
        } catch (Exception e) {
            log.error("환영 이메일 발송 실패: {}", toEmail, e);
            // 환영 이메일 실패는 무시 (필수가 아니므로)
        }
    }
    
    /**
     * 임시 비밀번호 이메일 HTML 템플릿
     */
    private String buildTempPasswordEmail(String username, String tempPassword) {
        return String.format("""
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                    .password-box { background: white; border: 2px dashed #007bff; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }
                    .password { font-size: 24px; font-weight: bold; color: #007bff; letter-spacing: 2px; }
                    .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px; color: #856404; }
                    .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>%s</h1>
                        <p>임시 비밀번호 안내</p>
                    </div>
                    <div class="content">
                        <p>안녕하세요, <strong>%s</strong>님!</p>
                        <p>요청하신 임시 비밀번호를 발송해드립니다.</p>
                        
                        <div class="password-box">
                            <p>임시 비밀번호</p>
                            <div class="password">%s</div>
                        </div>
                        
                        <div class="warning">
                            <h4>⚠️ 중요 안내사항</h4>
                            <ul>
                                <li>위 임시 비밀번호로 로그인하신 후 <strong>반드시 비밀번호를 변경</strong>해주세요.</li>
                                <li>임시 비밀번호는 보안상 다른 사람에게 노출되지 않도록 주의해주세요.</li>
                                <li>이 이메일을 요청하지 않으셨다면 고객센터로 문의해주세요.</li>
                            </ul>
                        </div>
                        
                        <p>로그인 후 [마이페이지] → [비밀번호 변경]에서 새로운 비밀번호로 변경하실 수 있습니다.</p>
                        
                        <div class="footer">
                            <p>본 메일은 발신전용입니다. 문의사항이 있으시면 고객센터를 이용해주세요.</p>
                            <p>&copy; 2024 %s. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """, appName, username, tempPassword, appName);
    }
    
    /**
     * 환영 이메일 HTML 템플릿
     */
    private String buildWelcomeEmail(String username) {
        return String.format("""
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                    .feature-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>%s에 오신 것을 환영합니다!</h1>
                        <p>🎉 회원가입이 완료되었습니다</p>
                    </div>
                    <div class="content">
                        <p>안녕하세요, <strong>%s</strong>님!</p>
                        <p>%s의 새로운 멤버가 되어주셔서 감사합니다.</p>
                        
                        <div class="feature-box">
                            <h3>🎪 이제 다음 서비스를 이용하실 수 있습니다:</h3>
                            <ul>
                                <li>전국 축제 정보 검색 및 조회</li>
                                <li>축제 리뷰 및 평점 작성</li>
                                <li>축제 즐겨찾기 및 일정 관리</li>
                                <li>다른 사용자들과의 커뮤니티 참여</li>
                            </ul>
                        </div>
                        
                        <p>궁금한 점이 있으시면 언제든지 고객센터로 문의해주세요.</p>
                        <p>즐거운 축제 탐험을 시작해보세요! 🚀</p>
                        
                        <div class="footer">
                            <p>본 메일은 발신전용입니다. 문의사항이 있으시면 고객센터를 이용해주세요.</p>
                            <p>&copy; 2024 %s. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """, appName, username, appName, appName);
    }
    
    /**
     * 간단한 텍스트 이메일 발송 (테스트용)
     */
    public void sendSimpleEmail(String toEmail, String subject, String content) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(content);
            
            mailSender.send(message);
            log.info("간단 이메일 발송 완료: {}", toEmail);
            
        } catch (Exception e) {
            log.error("간단 이메일 발송 실패: {}", toEmail, e);
            throw new RuntimeException("이메일 발송에 실패했습니다");
        }
    }
}
