package com.korea.festival.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.korea.festival.entity.Board;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long>{

}
