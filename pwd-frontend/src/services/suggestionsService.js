// AI-powered suggestions service for PWD reports
class SuggestionsService {
  
  // Generate suggestions based on PWD Registration Report data
  generatePWDRegistrationSuggestions(data) {
    const suggestions = [];
    const { totalRegistrations, monthlyTrends, barangayDistribution, disabilityTypeDistribution } = data;
    
    // Low registration suggestions
    if (totalRegistrations < 50) {
      suggestions.push({
        type: 'warning',
        title: 'Low Registration Numbers',
        description: 'Total registrations are below expected levels. Consider implementing outreach programs.',
        actions: [
          'Organize community awareness campaigns',
          'Partner with local healthcare providers',
          'Set up mobile registration units',
          'Create social media awareness campaigns'
        ],
        priority: 'high'
      });
    }
    
    // Monthly trend analysis
    if (monthlyTrends.length > 0) {
      const recentMonths = monthlyTrends.slice(-3);
      const avgRecent = recentMonths.reduce((sum, month) => sum + month.registrations, 0) / recentMonths.length;
      const avgOverall = monthlyTrends.reduce((sum, month) => sum + month.registrations, 0) / monthlyTrends.length;
      
      if (avgRecent < avgOverall * 0.7) {
        suggestions.push({
          type: 'warning',
          title: 'Declining Registration Trend',
          description: 'Recent months show declining registration numbers compared to historical average.',
          actions: [
            'Review and improve registration process',
            'Increase community outreach efforts',
            'Offer incentives for early registration',
            'Streamline application requirements'
          ],
          priority: 'high'
        });
      }
    }
    
    // Barangay distribution analysis
    if (barangayDistribution.length > 0) {
      const maxBarangay = Math.max(...barangayDistribution.map(b => b.count));
      const minBarangay = Math.min(...barangayDistribution.map(b => b.count));
      const lowPerformingBarangays = barangayDistribution.filter(b => b.count < maxBarangay * 0.3);
      
      if (lowPerformingBarangays.length > 0) {
        suggestions.push({
          type: 'info',
          title: 'Barangay Performance Gap',
          description: `${lowPerformingBarangays.length} barangays have significantly lower registration rates.`,
          actions: [
            'Provide additional training to barangay officials',
            'Allocate more resources to low-performing areas',
            'Create targeted outreach programs',
            'Establish performance incentives'
          ],
          priority: 'medium'
        });
      }
    }
    
    // Disability type analysis
    if (disabilityTypeDistribution.length > 0) {
      const totalDisabilities = disabilityTypeDistribution.reduce((sum, d) => sum + d.count, 0);
      const underrepresentedTypes = disabilityTypeDistribution.filter(d => d.count < totalDisabilities * 0.1);
      
      if (underrepresentedTypes.length > 0) {
        suggestions.push({
          type: 'info',
          title: 'Underrepresented Disability Types',
          description: 'Some disability types have very low registration numbers.',
          actions: [
            'Create specialized awareness campaigns',
            'Partner with disability-specific organizations',
            'Develop targeted support programs',
            'Improve accessibility for specific disabilities'
          ],
          priority: 'medium'
        });
      }
    }
    
    // Growth opportunity suggestions
    if (totalRegistrations > 0) {
      suggestions.push({
        type: 'success',
        title: 'Growth Opportunities',
        description: 'Based on current data, here are potential growth strategies.',
        actions: [
          'Implement digital registration system',
          'Create referral programs for existing members',
          'Establish partnerships with schools and workplaces',
          'Develop mobile app for easier access'
        ],
        priority: 'low'
      });
    }
    
    return suggestions;
  }
  
  // Generate suggestions based on Card Distribution Report data
  generateCardDistributionSuggestions(data) {
    const suggestions = [];
    const { totalCardsIssued, totalCardsPending, averageProcessingTime, cardStatusDistribution } = data;
    
    // High pending cards
    if (totalCardsPending > totalCardsIssued * 0.2) {
      suggestions.push({
        type: 'warning',
        title: 'High Pending Card Rate',
        description: `${((totalCardsPending / (totalCardsIssued + totalCardsPending)) * 100).toFixed(1)}% of cards are pending.`,
        actions: [
          'Increase card production capacity',
          'Streamline approval process',
          'Hire additional processing staff',
          'Implement automated status tracking'
        ],
        priority: 'high'
      });
    }
    
    // Processing time analysis
    if (averageProcessingTime > 30) {
      suggestions.push({
        type: 'warning',
        title: 'Slow Processing Time',
        description: `Average processing time is ${averageProcessingTime} days, which is above target.`,
        actions: [
          'Optimize workflow processes',
          'Implement digital document processing',
          'Create processing time benchmarks',
          'Provide staff training on efficiency'
        ],
        priority: 'high'
      });
    }
    
    // Status distribution analysis
    if (cardStatusDistribution.length > 0) {
      const rejectedCards = cardStatusDistribution.find(status => status.status === 'Rejected');
      if (rejectedCards && rejectedCards.count > 0) {
        suggestions.push({
          type: 'info',
          title: 'Card Rejection Analysis',
          description: `${rejectedCards.count} cards have been rejected. Review rejection reasons.`,
          actions: [
            'Analyze common rejection reasons',
            'Improve application guidelines',
            'Provide pre-submission assistance',
            'Create rejection appeal process'
          ],
          priority: 'medium'
        });
      }
    }
    
    return suggestions;
  }
  
  // Generate suggestions based on Benefits Distribution Report data
  generateBenefitsDistributionSuggestions(data) {
    const suggestions = [];
    const { totalBenefitsDistributed, monthlyBenefitTrends, benefitTypeDistribution } = data;
    
    // Low benefit distribution
    if (totalBenefitsDistributed < 100) {
      suggestions.push({
        type: 'warning',
        title: 'Low Benefit Distribution',
        description: 'Benefit distribution numbers are below expected levels.',
        actions: [
          'Increase benefit awareness campaigns',
          'Simplify benefit application process',
          'Expand benefit categories',
          'Partner with more service providers'
        ],
        priority: 'high'
      });
    }
    
    // Monthly trend analysis
    if (monthlyBenefitTrends.length > 0) {
      const recentMonths = monthlyBenefitTrends.slice(-3);
      const avgRecent = recentMonths.reduce((sum, month) => sum + month.distributed, 0) / recentMonths.length;
      
      if (avgRecent < 10) {
        suggestions.push({
          type: 'warning',
          title: 'Low Recent Benefit Distribution',
          description: 'Recent months show very low benefit distribution.',
          actions: [
            'Review benefit eligibility criteria',
            'Improve benefit notification system',
            'Create benefit distribution events',
            'Establish benefit hotline'
          ],
          priority: 'high'
        });
      }
    }
    
    // Benefit type analysis
    if (benefitTypeDistribution.length > 0) {
      const totalBenefits = benefitTypeDistribution.reduce((sum, b) => sum + b.count, 0);
      const underutilizedBenefits = benefitTypeDistribution.filter(b => b.count < totalBenefits * 0.1);
      
      if (underutilizedBenefits.length > 0) {
        suggestions.push({
          type: 'info',
          title: 'Underutilized Benefits',
          description: 'Some benefit types are not being fully utilized.',
          actions: [
            'Increase awareness of underutilized benefits',
            'Simplify application process for these benefits',
            'Provide training on benefit usage',
            'Review and update benefit descriptions'
          ],
          priority: 'medium'
        });
      }
    }
    
    return suggestions;
  }
  
  // Generate suggestions based on Complaints Analysis Report data
  generateComplaintsAnalysisSuggestions(data) {
    const suggestions = [];
    const { totalComplaints, resolvedComplaints, averageResolutionTime, complaintCategories } = data;
    
    // High complaint rate
    if (totalComplaints > 50) {
      suggestions.push({
        type: 'warning',
        title: 'High Complaint Volume',
        description: `${totalComplaints} complaints received. Review service quality.`,
        actions: [
          'Implement quality improvement programs',
          'Increase staff training',
          'Create feedback collection system',
          'Establish service standards'
        ],
        priority: 'high'
      });
    }
    
    // Resolution rate analysis
    const resolutionRate = totalComplaints > 0 ? (resolvedComplaints / totalComplaints) * 100 : 100;
    if (resolutionRate < 80) {
      suggestions.push({
        type: 'warning',
        title: 'Low Resolution Rate',
        description: `Only ${resolutionRate.toFixed(1)}% of complaints are resolved.`,
        actions: [
          'Improve complaint tracking system',
          'Assign dedicated complaint handlers',
          'Create resolution time targets',
          'Implement escalation procedures'
        ],
        priority: 'high'
      });
    }
    
    // Resolution time analysis
    if (averageResolutionTime > 14) {
      suggestions.push({
        type: 'warning',
        title: 'Slow Complaint Resolution',
        description: `Average resolution time is ${averageResolutionTime} days.`,
        actions: [
          'Streamline resolution process',
          'Implement automated status updates',
          'Create resolution templates',
          'Establish resolution time benchmarks'
        ],
        priority: 'high'
      });
    }
    
    // Category analysis
    if (complaintCategories.length > 0) {
      const topComplaintCategory = complaintCategories.reduce((prev, current) => 
        (prev.count > current.count) ? prev : current
      );
      
      suggestions.push({
        type: 'info',
        title: 'Top Complaint Category',
        description: `Most complaints are about: ${topComplaintCategory.category}`,
        actions: [
          `Focus improvement efforts on ${topComplaintCategory.category}`,
          'Create specialized training for this area',
          'Develop prevention strategies',
          'Establish best practices'
        ],
        priority: 'medium'
      });
    }
    
    return suggestions;
  }
  
  // Generate suggestions based on Monthly Activity Summary data
  generateMonthlyActivitySuggestions(data) {
    const suggestions = [];
    const { totalApplications, totalApprovals, totalRejections, totalCardsIssued } = data;
    
    // Approval rate analysis
    const approvalRate = totalApplications > 0 ? (totalApprovals / totalApplications) * 100 : 0;
    if (approvalRate < 70) {
      suggestions.push({
        type: 'warning',
        title: 'Low Approval Rate',
        description: `Approval rate is ${approvalRate.toFixed(1)}%, which is below target.`,
        actions: [
          'Review application requirements',
          'Provide better guidance to applicants',
          'Improve application review process',
          'Create application assistance programs'
        ],
        priority: 'high'
      });
    }
    
    // Rejection rate analysis
    const rejectionRate = totalApplications > 0 ? (totalRejections / totalApplications) * 100 : 0;
    if (rejectionRate > 30) {
      suggestions.push({
        type: 'warning',
        title: 'High Rejection Rate',
        description: `Rejection rate is ${rejectionRate.toFixed(1)}%. Review rejection reasons.`,
        actions: [
          'Analyze common rejection reasons',
          'Improve application guidelines',
          'Provide pre-submission assistance',
          'Create rejection appeal process'
        ],
        priority: 'high'
      });
    }
    
    // Card issuance efficiency
    if (totalApprovals > 0) {
      const cardIssuanceRate = (totalCardsIssued / totalApprovals) * 100;
      if (cardIssuanceRate < 80) {
        suggestions.push({
          type: 'warning',
          title: 'Low Card Issuance Rate',
          description: `Only ${cardIssuanceRate.toFixed(1)}% of approved applications have received cards.`,
          actions: [
            'Improve card production process',
            'Implement automated card issuance',
            'Create card pickup reminders',
            'Establish card delivery service'
          ],
          priority: 'high'
        });
      }
    }
    
    return suggestions;
  }
  
  // Get priority color for suggestion type
  getPriorityColor(priority) {
    switch (priority) {
      case 'high': return '#E74C3C';
      case 'medium': return '#F39C12';
      case 'low': return '#27AE60';
      default: return '#7F8C8D';
    }
  }
  
  // Get suggestion type color
  getTypeColor(type) {
    switch (type) {
      case 'warning': return '#E74C3C';
      case 'info': return '#3498DB';
      case 'success': return '#27AE60';
      default: return '#7F8C8D';
    }
  }
}

export default new SuggestionsService();
