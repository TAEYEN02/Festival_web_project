package com.korea.festival.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.korea.festival.dto.BoardRequestDTO;
import com.korea.festival.dto.BoardResponseDTO;
import com.korea.festival.entity.Board;
import com.korea.festival.entity.BoardLikes;
import com.korea.festival.entity.User;
import com.korea.festival.repository.BoardLikesRepository;
import com.korea.festival.repository.BoardRepository;
import com.korea.festival.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BoardService {
	
	private final BoardRepository boardRepository;
	private final BoardLikesRepository boardLikesRepository;
	private final UserRepository userRepository;
	
	//c
	public BoardResponseDTO boardWrtie(BoardRequestDTO dto,Long userId) {
		User user = userRepository.findById(userId)
				.orElseThrow(()->new RuntimeException("사용자 없음"));
		
		Board newBoard = Board.builder()
				.title(dto.getTitle())
				.content(dto.getContent())
				.category(dto.getCategory())
				.tags(dto.getTags())
				.user(user)
				.likes(0)
				.createdAt(LocalDateTime.now())
				.updatedAt(LocalDateTime.now())		
				.build();

		boardRepository.save(newBoard);
		BoardResponseDTO result = toDTO(newBoard, userId);
		
		return result;
	}
	
	//r-all
	public List<BoardResponseDTO> boardFindAll(Long userId){
		List<Board> boards = boardRepository.findAll();
		
		return boards.stream().map(board->{
			BoardResponseDTO dto = toDTO(board, userId);
			return dto;
		}).toList();
	}
	
	
	//r-detail
	@Transactional
	public BoardResponseDTO boardFindOne(Long boardId,Long userId) {
		Board board = boardRepository.findById(boardId)
				.orElseThrow(()->new RuntimeException("게시글 없음"));
		return toDTO(board, userId);
	}
	
	//u
	public BoardResponseDTO boardUpdate(BoardRequestDTO dto,Long userId) {
		Board board = boardRepository.findById(dto.getId())
				.orElseThrow(()->new RuntimeException("게시글 없음"));
		
		//작성자 확인
		if(!board.getUser().getId().equals(userId)) {
			throw new RuntimeException("작성자가 아닙니다.");
		}
		
		board.setTitle(dto.getTitle());
		board.setContent(dto.getContent());
		board.setCategory(dto.getCategory());
		board.setTags(dto.getTags());
		board.setUpdatedAt(LocalDateTime.now());
		
		return toDTO(board, userId);
	}
	
	//d
	public BoardResponseDTO boardDelete()
	
	
	//like
	@Transactional
	public BoardResponseDTO likeToggle(Long boardId,Long userId) {
		Board board = boardRepository.findById(userId)
				.orElseThrow(()->new RuntimeException("게시글 없음"));
		User user = userRepository.findById(userId)
				.orElseThrow(()->new RuntimeException("사용자 없음"));
		
		boardLikesRepository.findByBoardIdAndUserId(boardId, userId).ifPresentOrElse(
					exit ->{
						boardLikesRepository.delete(exit);
						board.setLikes(board.getLikes()-1);
					},
					()->{
						BoardLikes newLike = new BoardLikes();
						newLike.setBoard(board);
						newLike.setUser(user);
						boardLikesRepository.save(newLike);
						board.setLikes(board.getLikes()+1);
					}
				);
		return toDTO(board, userId);
	}
	
	//toDTO
	private BoardResponseDTO toDTO(Board board,Long currentUserId) {
		boolean liked = false;
		if(currentUserId != null) {
			liked = boardLikesRepository.existsByBoardIdAndUserId(board.getId(), currentUserId);
		}
		
		return BoardResponseDTO.builder()
				.id(board.getId())
				.title(board.getTitle())
				.content(board.getContent())
				.category(board.getCategory())
				.likes(board.getLikes())
				.likedByCurrentUser(liked)
				.authorNickname(board.getUser().getNickname())
				.tags(board.getTags())
				.createdAt(board.getCreatedAt())
				.updatedAt(board.getUpdatedAt())
				.build();
	}

}
