package com.enjoy.api.service.usr;

import com.enjoy.api.mapper.UsrMapper;
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

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsrService {
    private final UsrMapper usrMapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UsrInfoDTO findMyInfo(String loginId) {
        Usr user = usrMapper.findByLoginId(loginId)
                .orElseThrow(() -> new BusinessException(ErrorCodes.USER_NOT_FOUND, loginId));

        return UsrInfoDTO.builder()
                .loginId(user.getLoginId())
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
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


    @Transactional(readOnly = true)
    public UsrInfoDTO findUserByIdByAgencyAdmin(String adminLoginId, Long userId) {
        Usr admin = usrMapper.findByLoginId(adminLoginId).orElseThrow(() -> new BusinessException(ErrorCodes.USER_NOT_FOUND, "ID: " + userId));
        Long myAgencyId = admin.getAgcId();

        Usr targetUser = usrMapper.findById(userId).orElseThrow(() -> new BusinessException(ErrorCodes.USER_NOT_FOUND, adminLoginId));

        if (!myAgencyId.equals(targetUser.getAgcId())) {
            throw new BusinessException(ErrorCodes.ACCESS_DENIED);
        }

        return convertToInfoDTO(targetUser);
    }

    public Page<UsrInfoDTO> findAllUsersBySuperAdmin(UsrSearchCondition condition, Pageable pageable) {
        return findUsersInternal(condition, pageable);
    }

    public Page<UsrInfoDTO> findUsersByAgencyAdmin(String adminLoginId, UsrSearchCondition condition, Pageable pageable) {
        Usr admin = usrMapper.findByLoginId(adminLoginId)
                .orElseThrow(() -> new BusinessException(ErrorCodes.USER_NOT_FOUND, "ID: " + adminLoginId));
        Long myAgencyId = admin.getAgcId();
        condition.setAgcId(myAgencyId);
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
                .email(usr.getEmail())
                .role(usr.getRole())
                .agcId(usr.getAgcId())
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

        Usr newUser = Usr.builder()
                .loginId(loginId)
                .pw(passwordEncoder.encode(password))
                .name(name)
                .agcId(agcId)
                .role(role)
                .build();

        usrMapper.insert(newUser);
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
                requestDTO.getEmail(),
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

    public void deleteUserByAgencyAdmin(String adminLoginId, Long userId) {
        Usr admin = usrMapper.findByLoginId(adminLoginId)
                .orElseThrow(() -> new BusinessException(ErrorCodes.USER_NOT_FOUND, "Admin Login ID: " + adminLoginId));

        Long myAgencyId = admin.getAgcId();
        Usr userToDelete = usrMapper.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCodes.USER_NOT_FOUND, "User ID: " + userId));

        if (!myAgencyId.equals(userToDelete.getAgcId())) {
            throw new BusinessException(ErrorCodes.ACCESS_DENIED);
        }
        userToDelete.softDelete();
        usrMapper.updateStatusAndClearInfo(userToDelete);
    }
}
