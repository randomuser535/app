import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Header from '@/components/Header';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Privacy Policy"
        showBackButton
        onBackPress={() => router.back()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.lastUpdated}>Last updated: July 09, 2024</Text>
        </View>

        <View style={styles.tableOfContents}>
          <Text style={styles.tocTitle}>Table of Contents</Text>
          <Text style={styles.tocItem}>1. Information We Collect</Text>
          <Text style={styles.tocItem}>2. How We Use Your Information</Text>
          <Text style={styles.tocItem}>3. Information Sharing</Text>
          <Text style={styles.tocItem}>4. Data Security</Text>
          <Text style={styles.tocItem}>5. Cookies and Tracking</Text>
          <Text style={styles.tocItem}>6. Your Rights</Text>
          <Text style={styles.tocItem}>7. Children's Privacy</Text>
          <Text style={styles.tocItem}>8. International Transfers</Text>
          <Text style={styles.tocItem}>9. Changes to Privacy Policy</Text>
          <Text style={styles.tocItem}>10. Contact Us</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.sectionContent}>
            We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.
            {'\n\n'}Personal Information:
            {'\n'}• Name and contact information
            {'\n'}• Email address and phone number
            {'\n'}• Billing and shipping addresses
            {'\n'}• Payment information (processed securely)
            {'\n'}• Account credentials
            {'\n\n'}Usage Information:
            {'\n'}• Device information and identifiers
            {'\n'}• App usage patterns and preferences
            {'\n'}• Location data (with your permission)
            {'\n'}• Purchase history and browsing behavior
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.sectionContent}>
            We use the information we collect to:
            {'\n\n'}• Provide and improve our services
            {'\n'}• Process transactions and fulfill orders
            {'\n'}• Provide customer support
            {'\n'}• Personalize your shopping experience
            {'\n'}• Analyze usage patterns to improve our app
            {'\n'}• Prevent fraud and ensure security
            {'\n'}• Comply with legal obligations
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Information Sharing</Text>
          <Text style={styles.sectionContent}>
            We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
            {'\n\n'}• With service providers who help us operate our business
            {'\n'}• With payment processors to handle transactions
            {'\n'}• With shipping companies to deliver your orders
            {'\n'}• When required by law or to protect our rights
            {'\n'}• In connection with a business transfer or merger
            {'\n'}• With your explicit consent
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Data Security</Text>
          <Text style={styles.sectionContent}>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            {'\n\n'}• Encryption of sensitive data in transit and at rest
            {'\n'}• Regular security assessments and updates
            {'\n'}• Access controls and authentication measures
            {'\n'}• Employee training on data protection
            {'\n'}• Secure payment processing through certified providers
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Cookies and Tracking</Text>
          <Text style={styles.sectionContent}>
            We use cookies and similar tracking technologies to enhance your experience and analyze app usage. Types of cookies we use:
            {'\n\n'}Essential Cookies:
            {'\n'}• Required for basic app functionality
            {'\n'}• Cannot be disabled
            {'\n\n'}Analytics Cookies:
            {'\n'}• Help us understand how you use our app
            {'\n'}• Used to improve performance and features
            {'\n\n'}Preference Cookies:
            {'\n'}• Remember your settings and preferences
            {'\n'}• Enhance your user experience
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Your Rights</Text>
          <Text style={styles.sectionContent}>
            Depending on your location, you may have the following rights regarding your personal information:
            {'\n\n'}• Access: Request a copy of your personal data
            {'\n'}• Rectification: Correct inaccurate information
            {'\n'}• Erasure: Request deletion of your data
            {'\n'}• Portability: Receive your data in a portable format
            {'\n'}• Restriction: Limit how we process your data
            {'\n'}• Objection: Object to certain types of processing
            {'\n'}• Withdraw consent: Revoke previously given consent
            {'\n\n'}To exercise these rights, please contact us using the information provided below.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
          <Text style={styles.sectionContent}>
            Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us so we can delete such information.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. International Transfers</Text>
          <Text style={styles.sectionContent}>
            Your information may be transferred to and processed in countries other than your own. We ensure that such transfers are conducted in accordance with applicable data protection laws and that appropriate safeguards are in place to protect your information.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Changes to Privacy Policy</Text>
          <Text style={styles.sectionContent}>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy in the app and updating the "Last updated" date. Your continued use of our service after such changes constitutes acceptance of the updated policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Contact Us</Text>
          <Text style={styles.sectionContent}>
            If you have any questions about this Privacy Policy or our data practices, please contact us:
            {'\n\n'}Email: privacy@onetech.com
            {'\n'}Phone: 1-800-ONETECH
            {'\n'}Address: 123 Tech Street, Silicon Valley
            {'\n\n'}Data Protection Officer: dpo@onetech.com
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This Privacy Policy is designed to help you understand how we collect, use, and safeguard your personal information. Your privacy is important to us, and we are committed to protecting it.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  tableOfContents: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tocTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 16,
  },
  tocItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#2563EB',
    marginBottom: 8,
    paddingLeft: 8,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 22,
  },
  footer: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#047857',
    textAlign: 'center',
    lineHeight: 20,
  },
});