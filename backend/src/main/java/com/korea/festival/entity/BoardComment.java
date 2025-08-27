package com.korea.festival.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Data;

@Data
@Entity
@Builder
@Table(name = "board_comment")
public class BoardComment {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne
	private Board board;
	
	@ManyToOne
	private User user;
	
	private String content;
	private LocalDateTime createdAt = LocalDateTime.now();
	
	//대댓글
	@ManyToOne
	@JoinColumn(name = "parent_id")
	private BoardComment parent;
	
	@OneToMany(mappedBy = "parent",cascade = CascadeType.ALL)
	private List<BoardComment> replies = new ArrayList<>();
	
}
