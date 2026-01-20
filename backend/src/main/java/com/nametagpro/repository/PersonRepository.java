package com.nametagpro.repository;

import com.nametagpro.entity.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PersonRepository extends JpaRepository<Person, UUID> {

    List<Person> findByRosterIdOrderBySortOrderAsc(UUID rosterId);

    void deleteByRosterId(UUID rosterId);
}
