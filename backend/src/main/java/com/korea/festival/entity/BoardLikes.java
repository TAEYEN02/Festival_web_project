package com.korea.festival.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "board_likes",uniqueConstraints = @UniqueConstraint(columnNames = {"board_id","user_id"}))
public class BoardLikes {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne
	@JoinColumn(name = "board_id",nullable = false)
	private Board board;
	
	
	@ManyToOne
	@JoinColumn(name = "user_id",nullable = false)
	private User user;
	
	private LocalDateTime createAt = LocalDateTime.now();

}
