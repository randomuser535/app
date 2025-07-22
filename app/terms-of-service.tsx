import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Header from '@/components/Header';

export default function TermsOfServiceScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Terms of Service"
        showBackButton
        onBackPress={() => router.back()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Terms of Service</Text>
          <Text style={styles.lastUpdated}>Last updated: July 09, 2025</Text>
        </View>

        <View style={styles.tableOfContents}>
          <Text style={styles.tocTitle}>Table of Contents</Text>
          <Text style={styles.tocItem}>1. Acceptance of Terms</Text>
          <Text style={styles.tocItem}>2. Description of Service</Text>
          <Text style={styles.tocItem}>3. User Accounts</Text>
          <Text style={styles.tocItem}>4. Privacy Policy</Text>
          <Text style={styles.tocItem}>5. User Conduct</Text>
          <Text style={styles.tocItem}>6. Intellectual Property</Text>
          <Text style={styles.tocItem}>7. Purchases and Payments</Text>
          <Text style={styles.tocItem}>8. Shipping and Returns</Text>
          <Text style={styles.tocItem}>9. Disclaimers</Text>
          <Text style={styles.tocItem}>10. Limitation of Liability</Text>
          <Text style={styles.tocItem}>11. Termination</Text>
          <Text style={styles.tocItem}>12. Changes to Terms</Text>
          <Text style={styles.tocItem}>13. Contact Information</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.sectionContent}>
            By accessing and using the One Tech mobile application ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.sectionContent}>
            One Tech is an e-commerce platform that allows users to browse, search, and purchase technology products including smartphones, laptops, wearables, and accessories. Our service includes features such as product catalogs, shopping cart functionality, user accounts, order tracking, and customer support.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.sectionContent}>
            To access certain features of our Service, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Privacy Policy</Text>
          <Text style={styles.sectionContent}>
            Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our Service. By using our Service, you agree to the collection and use of information in accordance with our Privacy Policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. User Conduct</Text>
          <Text style={styles.sectionContent}>
            You agree not to use the Service to:
            {'\n\n'}• Violate any applicable laws or regulations
            {'\n'}• Infringe upon the rights of others
            {'\n'}• Transmit any harmful or malicious content
            {'\n'}• Attempt to gain unauthorized access to our systems
            {'\n'}• Interfere with the proper functioning of the Service
            {'\n'}• Use the Service for any commercial purpose without our consent
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Intellectual Property</Text>
          <Text style={styles.sectionContent}>
            The Service and its original content, features, and functionality are and will remain the exclusive property of One Tech and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used without our prior written consent.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Purchases and Payments</Text>
          <Text style={styles.sectionContent}>
            All purchases made through our Service are subject to our acceptance. We reserve the right to refuse or cancel any order for any reason. Prices are subject to change without notice. Payment must be received by us before we ship any products. We accept major credit cards, PayPal, and other payment methods as indicated in our app.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Shipping and Returns</Text>
          <Text style={styles.sectionContent}>
            We will ship products to the address you specify in your order. Shipping times and costs vary by location and shipping method selected. We offer a 30-day return policy for most items in original condition. Electronics have a 14-day return window. Return shipping costs may apply unless the item was defective or incorrectly shipped.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Disclaimers</Text>
          <Text style={styles.sectionContent}>
            The information on this Service is provided on an "as is" basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms whether express or implied, statutory or otherwise. We do not guarantee that the Service will be uninterrupted or error-free.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Limitation of Liability</Text>
          <Text style={styles.sectionContent}>
            In no event shall One Tech, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Termination</Text>
          <Text style={styles.sectionContent}>
            We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Changes to Terms</Text>
          <Text style={styles.sectionContent}>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. Contact Information</Text>
          <Text style={styles.sectionContent}>
            If you have any questions about these Terms of Service, please contact us:
            {'\n\n'}Email: legal@onetech.com
            {'\n'}Phone: 1-800-ONETECH
            {'\n'}Address: 123 Tech Street, Silicon Valley
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using One Tech, you acknowledge that you have read and understood these Terms of Service and agree to be bound by them.
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
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1E40AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});