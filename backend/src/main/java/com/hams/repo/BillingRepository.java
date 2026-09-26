package com.hams.repo;

import com.hams.model.Billing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BillingRepository extends JpaRepository<Billing, Long> {

    List<Billing> findAllByOrderByBillingDateDescIdDesc();

    List<Billing> findByPatientIdOrderByBillingDateDesc(String patientId);

    List<Billing> findByDoctorIdOrderByBillingDateDesc(String doctorId);

    Optional<Billing> findByInvoiceNumber(String invoiceNumber);

    boolean existsByInvoiceNumber(String invoiceNumber);
}