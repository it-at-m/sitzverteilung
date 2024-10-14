/*
 * Copyright (c): it@M - Dienstleister für Informations- und Telekommunikationstechnik
 * der Landeshauptstadt München, 2024
 */
package de.muenchen.sitzverteilung.security;

import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.security.access.prepost.PreAuthorize;

/**
 * Each possible authority in this project is represented by an enum.
 * The enums are used within the {@link PagingAndSortingRepository}
 * in the annotation e.g. {@link PreAuthorize}.
 */
public enum AuthoritiesEnum {
    SITZVERTEILUNG_READ_THEENTITY, SITZVERTEILUNG_WRITE_THEENTITY, SITZVERTEILUNG_DELETE_THEENTITY,
    // add your authorities here and also add these new authorities to sso-authorisation.json.

}
