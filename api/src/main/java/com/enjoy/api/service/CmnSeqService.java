package com.enjoy.api.service;

import com.enjoy.api.mapper.CmnSeqMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CmnSeqService {
    private final CmnSeqMapper cmnSeqMapper;


    @Transactional(propagation = Propagation.REQUIRES_NEW,
            isolation = Isolation.READ_COMMITTED)
    public long getNextSequenceValue(String seqName) {

        int updatedRows = cmnSeqMapper.incrementValueByName(seqName);


        if (updatedRows == 0) {
            long initialValue = 1;
            try {
                cmnSeqMapper.insertSequence(seqName, initialValue);
                return initialValue;
            } catch (Exception e) {
                if (cmnSeqMapper.incrementValueByName(seqName) > 0) {
                    Long currentValue = cmnSeqMapper.findCurrentValueByName(seqName);
                    if (currentValue != null) return currentValue;
                    else throw new RuntimeException("Failed to retrieve sequence after concurrent insert for: " + seqName);
                } else {
                    throw new RuntimeException("Failed to initialize sequence: " + seqName, e);
                }
            }
        } else {
            Long currentValue = cmnSeqMapper.findCurrentValueByName(seqName);
            if (currentValue != null) return currentValue;
            else throw new RuntimeException("Failed to retrieve sequence after increment for: " + seqName);
        }
    }
}
