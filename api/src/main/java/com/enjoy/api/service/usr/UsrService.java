package com.enjoy.api.service.usr;

import com.enjoy.api.mapper.UsrMapper;
import com.enjoy.api.mapper.UsrPwLogMapper;
import com.enjoy.api.mapper.UsrPwMapper;
import com.enjoy.api.service.CmnSeqService;
import com.enjoy.common.domain.Usr;
import com.enjoy.common.dto.usr.*;
import com.enjoy.common.exception.BusinessException;
import com.enjoy.common.exception.ErrorCodes;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsrService {
    private final UsrMapper usrMapper;
    private final UsrPwMapper usrPwMapper;
    private final PasswordEncoder passwordEncoder;
    private final CmnSeqService cmnSeqService;
    private final UsrPwLogMapper usrPwLogMapper;

    @Transactional(readOnly = true)
    public UsrInfoDTO findMyInfo(String loginId) {
        Usr user = usrMapper.findByLoginId(loginId)
                .orElseThrow(() -> new BusinessException(ErrorCodes.USER_NOT_FOUND, loginId));

        return UsrInfoDTO.builder()
                .loginId(user.getLoginId())
                .id(user.getId())
                .name(user.getName())
                .role(user.getRole())
                .build();
    }

    @Transactional(readOnly = true)
    public UsrInfoDTO findUsrById(Long id) {
        Usr user = usrMapper.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCodes.USER_NOT_FOUND, "ID: " + id));

        return convertToInfoDTO(user);
    }

    @Transactional(readOnly = true)
    public UsrInfoDTO findUserByIdBySuperAdmin(Long userId) {
        Usr user = usrMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCodes.USER_NOT_FOUND, "ID: " + userId));

        return convertToInfoDTO(user);
    }


    public Page<UsrInfoDTO> findAllUsersBySuperAdmin(UsrSearchCondition condition, Pageable pageable) {
        return findUsersInternal(condition, pageable);
    }

    private Page<UsrInfoDTO> findUsersInternal(UsrSearchCondition condition, Pageable pageable) {
        List<Usr> usrList = usrMapper.findWithPagingAndFilter(condition, pageable);

        List<UsrInfoDTO> dtoList = usrList.stream()
                .map(this::convertToInfoDTO)
                .collect(Collectors.toList());

        long total = usrMapper.countWithFilter(condition);

        return new PageImpl<>(dtoList, pageable, total);
    }

    private UsrInfoDTO convertToInfoDTO(Usr usr) {
        return UsrInfoDTO.builder()
                .id(usr.getId())
                .loginId(usr.getLoginId())
                .name(usr.getName())
                .role(usr.getRole())
                .agcId(usr.getAgcId())
                .regDt(usr.getRegDt())
                .build();
    }


    public UsrInfoDTO createUserBySuperAdmin(UsrAddDTO requestDTO) {
        return createUserInternal(
                requestDTO.getLoginId(),
                requestDTO.getPassword(),
                requestDTO.getName(),
                requestDTO.getAgcId(),
                requestDTO.getRole()
        );
    }


    private UsrInfoDTO createUserInternal(String loginId, String password, String name, Long agcId, String role) {
        if (usrMapper.existsByLoginId(loginId) > 0) {
            throw new BusinessException(ErrorCodes.DUPLICATE_LOGIN_ID);
        }

        long newUsrId = cmnSeqService.getNextSequenceValue("USR");

        Usr newUser = Usr.builder()
                .id(newUsrId)
                .loginId(loginId)
                .pw(passwordEncoder.encode(password))
                .name(name)
                .agcId(agcId)
                .role(role)
                .regDt(LocalDateTime.now())
                .build();

        usrMapper.insert(newUser);

        String encodedPassword = passwordEncoder.encode(password);
        usrPwMapper.insert(newUser.getId(), encodedPassword);
        long logId = cmnSeqService.getNextSequenceValue("USR_PW_LOG");
        usrPwLogMapper.insertLog(logId, newUser.getId(), "INIT");

        return convertToInfoDTO(newUser);
    }

    @Transactional(readOnly = true)
    public UsrAccountDTO findUserAccountByLoginId(String loginId) {
        Usr userEntity = usrMapper.findByLoginId(loginId)
                .orElseThrow(() -> new BusinessException(ErrorCodes.USER_NOT_FOUND, "ID: " + loginId));
        return UsrAccountDTO.builder()
                .id(userEntity.getId())
                .loginId(userEntity.getLoginId())
                .pw(userEntity.getPw())
                .role(userEntity.getRole())
                .agcId(userEntity.getAgcId())
                .build();
    }

    @Transactional
    public UsrInfoDTO updateUserBySuperAdmin(Long userId, UsrUpdateDTO requestDTO) {
        Usr userToUpdate = usrMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCodes.USER_NOT_FOUND, "ID: " + userId));

        userToUpdate.updateInfo(
                requestDTO.getName(),
                requestDTO.getRole(),
                requestDTO.getAgcId()
        );
        usrMapper.update(userToUpdate);
        return convertToInfoDTO(userToUpdate);
    }

    public Optional<UsrInfoDTO> findFirstManagerByAgcId(Long agcId) {
        return usrMapper.findFirstManagerByAgcId(agcId);
    }


    public void deleteUserBySuperAdmin(Long userId) {
        Usr userToDelete = usrMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCodes.USER_NOT_FOUND, "ID: " + userId));
        userToDelete.softDelete();
        usrMapper.updateStatusAndClearInfo(userToDelete);
    }

    @Transactional(readOnly = true)
    public boolean isLoginIdDuplicate(String loginId) {
        return usrMapper.existsByLoginId(loginId) > 0;
    }

    @Transactional
    public void updateUserPassword(Long userId, String newPassword) {
        Usr user = usrMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCodes.USER_NOT_FOUND, "ID: " + userId));
        String oldPw = usrPwLogMapper.findCurrentPasswordByUsrId(userId)
                .orElse("UNKNOWN");
        String encodedPassword = passwordEncoder.encode(newPassword);
        usrPwMapper.update(userId, encodedPassword);
        long logId = cmnSeqService.getNextSequenceValue("USR_PW_LOG");
        usrPwLogMapper.insertLog(logId, userId, oldPw);
    }

    @Transactional
    public void updateMyPassword(String loginId, String currentPassword, String newPassword) {
        UsrAccountDTO userAccount = this.findUserAccountByLoginId(loginId);
        if (!passwordEncoder.matches(currentPassword, userAccount.getPw())) {
            throw new BusinessException(ErrorCodes.INVALID_PASSWORD, "현재 비밀번호가 일치하지 않습니다.");
        }
        this.updateUserPassword(userAccount.getId(), newPassword);
    }

    @Transactional
    public void bulkDeleteUsers(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return;
        }
        usrMapper.bulkUpdateStatus(ids, "DELETED");
    }
}

