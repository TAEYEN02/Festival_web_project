package com.korea.festival.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.korea.festival.dto.BoardCommentRequestDTO;
import com.korea.festival.dto.BoardCommentResponseDTO;
import com.korea.festival.dto.BoardRequestDTO;
import com.korea.festival.dto.BoardResponseDTO;
import com.korea.festival.entity.Board;
import com.korea.festival.entity.BoardComment;
import com.korea.festival.entity.BoardLikes;
import com.korea.festival.entity.User;
import com.korea.festival.repository.BoardCommentRepository;
import com.korea.festival.repository.BoardLikesRepository;
import com.korea.festival.repository.BoardRepository;
import com.korea.festival.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BoardService {
	
	private final BoardCommentRepository commentRepository;
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
	public Page<BoardResponseDTO> boardFindAll(int page, int size, Long userId){
		
		Pageable pageable = PageRequest.of(page, size,Sort.by("createdAt").descending());
		
		Page<Board> boards = boardRepository.findAll(pageable);
		
		return boards.map(board->toDTO(board,userId));
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
		if(!board.getUser().getId().equals(userId)&&!userId.equals(1L)) {
			throw new RuntimeException("작성자가 아닙니다.");
		}
		
		board.setTitle(dto.getTitle());
		board.setContent(dto.getContent());
		board.setCategory(dto.getCategory());
		board.setTags(dto.getTags());
		board.setUpdatedAt(LocalDateTime.now());
		//내가 추가함
		boardRepository.save(board);
		
		return toDTO(board, userId);
	}
	
	//d
	public boolean boardDelete(Long boardId,Long userId) {
		userRepository.findById(userId)
		.orElseThrow(()->new RuntimeException("유저가 없습니다"));
		
		Board board = boardRepository.findById(boardId)
				.orElseThrow(()->new RuntimeException("게시글 없음"));
		
		if(!board.getUser().getId().equals(userId)&&!userId.equals(1L)) {
			throw new RuntimeException("작성자가 아닙니다.");
		}
		
		if(!boardRepository.existsById(boardId)) {
			return false;
		}
		
		boardRepository.deleteById(boardId);
		
		return !boardRepository.existsById(boardId);
	}
	
	
	//like
	@Transactional
	public BoardResponseDTO likeToggle(Long boardId,Long userId) {
		Board board = boardRepository.findById(boardId)
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
	private BoardResponseDTO toDTO(Board board, Long currentUserId) {
	    boolean liked = false;
	    if (currentUserId != null) {
	        liked = boardLikesRepository.existsByBoardIdAndUserId(board.getId(), currentUserId);
	    }

	    // 댓글 변환
	    List<BoardCommentResponseDTO> commentDTOs = board.getComments().stream()
	            .map(this::toDTO) // 재귀적 변환
	            .collect(Collectors.toList());

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
	            .comments(commentDTOs)
	            .build();
	}
	
	///////////////////////////////////////////////////////////////////////////////////////////

	// 댓글 생성
    public BoardCommentResponseDTO commentWrite(BoardCommentRequestDTO requestDTO) {
        Board board = boardRepository.findById(requestDTO.getBoardId())
                .orElseThrow(() -> new RuntimeException("게시글 없음"));

        User user = userRepository.findById(requestDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("사용자 없음"));

        BoardComment parent = null;
        if(requestDTO.getParentId() != null) {
            parent = commentRepository.findById(requestDTO.getParentId())
                    .orElseThrow(() -> new RuntimeException("부모 댓글 없음"));
        }

        BoardComment comment = BoardComment.builder()
                .board(board)
                .user(user)
                .content(requestDTO.getContent())
                .parent(parent)
                .build();

        BoardComment saved = commentRepository.save(comment);
        return toDTO(saved);
    }

    // 댓글 수정
    public BoardCommentResponseDTO commentUpdate(Long commentId, BoardCommentRequestDTO requestDTO) {
        BoardComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글 없음"));

        comment.setContent(requestDTO.getContent());
        BoardComment updated = commentRepository.save(comment);
        return toDTO(updated);
    }

    // 댓글 삭제
    public void commentDelete(Long commentId) {
        commentRepository.deleteById(commentId);
    }

    // 단일 댓글 조회
    public BoardCommentResponseDTO commentFindOne(Long commentId) {
        BoardComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("댓글 없음"));
        return toDTO(comment);
    }

    // 게시글 댓글 전체 조회 (최상위 + 대댓글)
    public List<BoardCommentResponseDTO> commentFindAll(Long boardId) {
        List<BoardComment> comments = commentRepository.findByBoardIdAndParentIsNull(boardId);
        return comments.stream().map(this::toDTO).collect(Collectors.toList());
    }

    // DTO 변환 (재귀)
    private BoardCommentResponseDTO toDTO(BoardComment comment) {
    	
        if (comment == null) {
            return null;
        }
        
        BoardCommentResponseDTO dto = BoardCommentResponseDTO.builder()
                .id(comment.getId())
                .userId(comment.getUser() != null ? comment.getUser().getId() : null)
                .userNickname(comment.getUser() != null ? comment.getUser().getNickname() : null)
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .replies(new ArrayList<>()) // 기본값으로 빈 리스트 설정
                .build();
    	
        if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
            List<BoardCommentResponseDTO> replyDTOs = comment.getReplies().stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
            dto.setReplies(replyDTOs);
        }

        return dto;
    }
	
}
