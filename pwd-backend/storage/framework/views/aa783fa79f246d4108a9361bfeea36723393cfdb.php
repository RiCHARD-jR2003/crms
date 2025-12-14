<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Disability Assessment Form</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DejaVu Sans', Arial, sans-serif; font-size: 11px; line-height: 1.4; color: #333; }
        .page { padding: 20px 30px; }
        
        .header { text-align: center; border-bottom: 3px solid #0b87ac; padding-bottom: 15px; margin-bottom: 20px; }
        .header h1 { font-size: 16px; color: #0b87ac; margin-bottom: 5px; }
        .header h2 { font-size: 14px; color: #2C3E50; margin-bottom: 5px; }
        .header p { font-size: 10px; color: #666; }
        
        .logo-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        
        .reference-box { background: #E8F4FD; border: 2px solid #0b87ac; padding: 10px; text-align: center; margin-bottom: 20px; }
        .reference-box .ref-number { font-size: 16px; font-weight: bold; color: #0b87ac; }
        .reference-box .ref-label { font-size: 10px; color: #666; }
        
        .section { margin-bottom: 15px; }
        .section-title { background: #0b87ac; color: white; padding: 8px 12px; font-size: 12px; font-weight: bold; margin-bottom: 10px; }
        .section-content { padding: 0 10px; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        table th, table td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; font-size: 10px; }
        table th { background: #f5f5f5; font-weight: bold; width: 30%; }
        
        .field-row { display: flex; margin-bottom: 8px; }
        .field-label { font-weight: bold; width: 35%; color: #555; }
        .field-value { width: 65%; }
        
        .severity-box { display: inline-block; padding: 3px 10px; border-radius: 3px; font-weight: bold; color: white; font-size: 10px; }
        .severity-mild { background: #27AE60; }
        .severity-moderate { background: #F39C12; }
        .severity-severe { background: #E74C3C; }
        .severity-profound { background: #8E44AD; }
        
        .checkbox { display: inline-block; width: 12px; height: 12px; border: 1px solid #333; margin-right: 5px; vertical-align: middle; }
        .checkbox.checked { background: #0b87ac; }
        .checkbox.checked::after { content: "✓"; color: white; font-size: 10px; display: block; text-align: center; line-height: 10px; }
        
        .signature-section { margin-top: 30px; display: flex; justify-content: space-between; }
        .signature-box { width: 45%; text-align: center; }
        .signature-line { border-top: 1px solid #333; margin-top: 40px; padding-top: 5px; }
        
        .notes-box { background: #FFF9E6; border: 1px solid #F39C12; padding: 10px; margin-top: 10px; }
        .notes-box h4 { color: #F39C12; margin-bottom: 5px; }
        
        .footer { text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 9px; color: #666; }
        
        .two-column { display: flex; gap: 20px; }
        .two-column > div { flex: 1; }
        
        .list-item { margin-bottom: 3px; padding-left: 15px; position: relative; }
        .list-item::before { content: "•"; position: absolute; left: 0; color: #0b87ac; }
    </style>
</head>
<body>
    <div class="page">
        <!-- Header -->
        <div class="header">
            <h1>REPUBLIC OF THE PHILIPPINES</h1>
            <h2>CITY OF CABUYAO - PERSONS WITH DISABILITY AFFAIRS OFFICE</h2>
            <h1 style="margin-top: 10px;">DISABILITY ASSESSMENT FORM</h1>
            <p>Generated on: <?php echo e($generatedAt); ?></p>
        </div>
        
        <!-- Reference Number -->
        <div class="reference-box">
            <div class="ref-label">Assessment Reference Number</div>
            <div class="ref-number"><?php echo e($assessment->reference_number); ?></div>
        </div>
        
        <!-- Applicant Information -->
        <div class="section">
            <div class="section-title">I. APPLICANT INFORMATION</div>
            <div class="section-content">
                <table>
                    <tr>
                        <th>Full Name</th>
                        <td colspan="3"><?php echo e($assessment->applicant_name); ?></td>
                    </tr>
                    <tr>
                        <th>Email Address</th>
                        <td><?php echo e($assessment->applicant_email ?? 'N/A'); ?></td>
                        <th>Contact Number</th>
                        <td><?php echo e($assessment->applicant_contact ?? 'N/A'); ?></td>
                    </tr>
                    <?php if($application): ?>
                    <tr>
                        <th>Address</th>
                        <td colspan="3"><?php echo e($application->address); ?>, <?php echo e($application->barangay); ?>, <?php echo e($application->city); ?></td>
                    </tr>
                    <tr>
                        <th>Birth Date</th>
                        <td><?php echo e($application->birthDate ? \Carbon\Carbon::parse($application->birthDate)->format('F d, Y') : 'N/A'); ?></td>
                        <th>Gender</th>
                        <td><?php echo e($application->gender ?? 'N/A'); ?></td>
                    </tr>
                    <?php endif; ?>
                </table>
            </div>
        </div>
        
        <!-- Assessment Schedule -->
        <div class="section">
            <div class="section-title">II. ASSESSMENT SCHEDULE</div>
            <div class="section-content">
                <table>
                    <tr>
                        <th>Assessment Date</th>
                        <td><?php echo e($assessment->assessment_date ? \Carbon\Carbon::parse($assessment->assessment_date)->format('F d, Y') : 'N/A'); ?></td>
                        <th>Time Slot</th>
                        <td><?php echo e($timeSlots[$assessment->slot_number] ?? 'N/A'); ?></td>
                    </tr>
                    <tr>
                        <th>Status</th>
                        <td colspan="3">
                            <span style="color: <?php echo e($assessment->status === 'finalized' ? '#27AE60' : '#F39C12'); ?>; font-weight: bold;">
                                <?php echo e(strtoupper($assessment->status_label)); ?>

                            </span>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
        
        <!-- Disability Information -->
        <div class="section">
            <div class="section-title">III. DISABILITY INFORMATION</div>
            <div class="section-content">
                <table>
                    <tr>
                        <th>Type of Disability</th>
                        <td><?php echo e($assessment->disability_type ?? 'N/A'); ?></td>
                        <th>Severity</th>
                        <td>
                            <?php if($assessment->disability_severity): ?>
                            <span class="severity-box severity-<?php echo e($assessment->disability_severity); ?>">
                                <?php echo e(strtoupper($assessment->disability_severity)); ?>

                            </span>
                            <?php else: ?>
                            N/A
                            <?php endif; ?>
                        </td>
                    </tr>
                    <tr>
                        <th>Cause of Disability</th>
                        <td><?php echo e($assessment->disability_cause ?? 'N/A'); ?></td>
                        <th>Onset Date</th>
                        <td><?php echo e($assessment->disability_onset_date ? \Carbon\Carbon::parse($assessment->disability_onset_date)->format('F d, Y') : 'N/A'); ?></td>
                    </tr>
                    <tr>
                        <th>Description</th>
                        <td colspan="3"><?php echo e($assessment->disability_description ?? 'N/A'); ?></td>
                    </tr>
                </table>
            </div>
        </div>
        
        <!-- Functional Limitations -->
        <div class="section">
            <div class="section-title">IV. FUNCTIONAL ASSESSMENT</div>
            <div class="section-content">
                <table>
                    <tr>
                        <th>Mobility Status</th>
                        <td><?php echo e($assessment->mobility_status ?? 'N/A'); ?></td>
                    </tr>
                    <tr>
                        <th>Communication Ability</th>
                        <td><?php echo e($assessment->communication_ability ?? 'N/A'); ?></td>
                    </tr>
                    <tr>
                        <th>Self-Care Ability</th>
                        <td><?php echo e($assessment->self_care_ability ?? 'N/A'); ?></td>
                    </tr>
                    <tr>
                        <th>Learning Ability</th>
                        <td><?php echo e($assessment->learning_ability ?? 'N/A'); ?></td>
                    </tr>
                    <tr>
                        <th>Functional Limitations</th>
                        <td>
                            <?php if($assessment->functional_limitations && count($assessment->functional_limitations) > 0): ?>
                                <?php $__currentLoopData = $assessment->functional_limitations; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $limitation): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                <div class="list-item"><?php echo e($limitation); ?></div>
                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                            <?php else: ?>
                                N/A
                            <?php endif; ?>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
        
        <!-- Medical Information -->
        <div class="section">
            <div class="section-title">V. MEDICAL INFORMATION</div>
            <div class="section-content">
                <table>
                    <tr>
                        <th>Attending Physician</th>
                        <td><?php echo e($assessment->attending_physician ?? 'N/A'); ?></td>
                        <th>License No.</th>
                        <td><?php echo e($assessment->physician_license_no ?? 'N/A'); ?></td>
                    </tr>
                    <tr>
                        <th>Medical Facility</th>
                        <td colspan="3"><?php echo e($assessment->medical_facility ?? 'N/A'); ?></td>
                    </tr>
                    <tr>
                        <th>Medical Findings</th>
                        <td colspan="3"><?php echo e($assessment->medical_findings ?? 'N/A'); ?></td>
                    </tr>
                    <tr>
                        <th>Recommendations</th>
                        <td colspan="3"><?php echo e($assessment->recommendations ?? 'N/A'); ?></td>
                    </tr>
                </table>
            </div>
        </div>
        
        <!-- Assistive Devices -->
        <div class="section">
            <div class="section-title">VI. ASSISTIVE DEVICES</div>
            <div class="section-content">
                <table>
                    <tr>
                        <th>Current Devices</th>
                        <td>
                            <?php if($assessment->assistive_devices_current && count($assessment->assistive_devices_current) > 0): ?>
                                <?php echo e(implode(', ', $assessment->assistive_devices_current)); ?>

                            <?php else: ?>
                                None
                            <?php endif; ?>
                        </td>
                    </tr>
                    <tr>
                        <th>Devices Needed</th>
                        <td>
                            <?php if($assessment->assistive_devices_needed && count($assessment->assistive_devices_needed) > 0): ?>
                                <?php echo e(implode(', ', $assessment->assistive_devices_needed)); ?>

                            <?php else: ?>
                                None specified
                            <?php endif; ?>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
        
        <!-- Notes -->
        <?php if($assessment->assessor_notes || $assessment->applicant_remarks): ?>
        <div class="section">
            <div class="section-title">VII. ADDITIONAL NOTES</div>
            <div class="section-content">
                <?php if($assessment->assessor_notes): ?>
                <div class="notes-box">
                    <h4>Assessor's Notes:</h4>
                    <p><?php echo e($assessment->assessor_notes); ?></p>
                </div>
                <?php endif; ?>
                <?php if($assessment->applicant_remarks): ?>
                <div class="notes-box" style="background: #E8F4FD; border-color: #0b87ac;">
                    <h4 style="color: #0b87ac;">Applicant's Remarks:</h4>
                    <p><?php echo e($assessment->applicant_remarks); ?></p>
                </div>
                <?php endif; ?>
            </div>
        </div>
        <?php endif; ?>
        
        <!-- Signatures -->
        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-line">
                    <strong><?php echo e($assessment->applicant_name); ?></strong><br>
                    <small>Applicant's Signature</small>
                </div>
            </div>
            <div class="signature-box">
                <div class="signature-line">
                    <strong><?php echo e($assessment->finalizer ? $assessment->finalizer->firstName . ' ' . $assessment->finalizer->lastName : '________________'); ?></strong><br>
                    <small>Assessing Officer</small>
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p>This document was generated by the Cabuyao PDAO PWD Registration System</p>
            <p>Reference: <?php echo e($assessment->reference_number); ?> | Generated: <?php echo e($generatedAt); ?></p>
            <?php if($assessment->finalized_at): ?>
            <p>Finalized: <?php echo e(\Carbon\Carbon::parse($assessment->finalized_at)->format('F d, Y h:i A')); ?></p>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>

<?php /**PATH C:\Users\Ivan\Desktop\HAHA\crms\pwd-backend\resources\views/pdfs/disability-assessment.blade.php ENDPATH**/ ?>