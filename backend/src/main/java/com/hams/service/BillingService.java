package com.hams.service;

import com.hams.model.Billing;
import com.hams.repo.BillingRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class BillingService {

    private final BillingRepository billingRepository;

    public BillingService(BillingRepository billingRepository) {
        this.billingRepository = billingRepository;
    }

    public Billing createBilling(Billing billing) {
        calculateAmounts(billing);
        return billingRepository.save(billing);
    }

    public List<Billing> getAllBillings() {
        return billingRepository.findAllByOrderByBillingDateDescIdDesc();
    }

    public Billing getBillingById(Long id) {
        return billingRepository.findById(id).orElse(null);
    }

    public List<Billing> getBillingsByPatient(String patientId) {
        return billingRepository.findByPatientIdOrderByBillingDateDesc(patientId);
    }

    public List<Billing> getBillingsByDoctor(String doctorId) {
        return billingRepository.findByDoctorIdOrderByBillingDateDesc(doctorId);
    }

    public Billing updateBilling(Long id, Billing billing) {
        Billing existing = billingRepository.findById(id).orElse(null);

        if (existing == null) {
            return null;
        }

        existing.setInvoiceNumber(billing.getInvoiceNumber());
        existing.setPatientId(billing.getPatientId());
        existing.setDoctorId(billing.getDoctorId());
        existing.setAppointmentId(billing.getAppointmentId());
        existing.setServiceName(billing.getServiceName());
        existing.setBillingDate(billing.getBillingDate());
        existing.setAmount(billing.getAmount());
        existing.setDiscount(billing.getDiscount());
        existing.setTax(billing.getTax());
        existing.setPaidAmount(billing.getPaidAmount());
        existing.setPaymentMethod(billing.getPaymentMethod());
        existing.setPaymentStatus(billing.getPaymentStatus());
        existing.setNotes(billing.getNotes());

        calculateAmounts(existing);

        return billingRepository.save(existing);
    }

    public boolean deleteBilling(Long id) {
        if (!billingRepository.existsById(id)) {
            return false;
        }

        billingRepository.deleteById(id);
        return true;
    }

    private void calculateAmounts(Billing billing) {
        BigDecimal amount = safeValue(billing.getAmount());
        BigDecimal discount = safeValue(billing.getDiscount());
        BigDecimal tax = safeValue(billing.getTax());
        BigDecimal paidAmount = safeValue(billing.getPaidAmount());

        BigDecimal subtotal = amount.subtract(discount);

        if (subtotal.compareTo(BigDecimal.ZERO) < 0) {
            subtotal = BigDecimal.ZERO;
        }

        BigDecimal total = subtotal.add(tax);

        if (paidAmount.compareTo(BigDecimal.ZERO) < 0) {
            paidAmount = BigDecimal.ZERO;
        }

        if (paidAmount.compareTo(total) > 0) {
            paidAmount = total;
        }

        BigDecimal due = total.subtract(paidAmount);

        billing.setAmount(amount);
        billing.setDiscount(discount);
        billing.setTax(tax);
        billing.setTotalAmount(total);
        billing.setPaidAmount(paidAmount);
        billing.setDueAmount(due);

        if (due.compareTo(BigDecimal.ZERO) == 0) {
            billing.setPaymentStatus("PAID");
        } else if (paidAmount.compareTo(BigDecimal.ZERO) > 0) {
            billing.setPaymentStatus("PARTIAL");
        } else {
            billing.setPaymentStatus("PENDING");
        }
    }

    private BigDecimal safeValue(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}