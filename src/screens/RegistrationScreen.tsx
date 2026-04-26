import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import { saveUserProfile, getUserProfile } from '../db/database';

export default function RegistrationScreen() {
  const [id, setId] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [therapistPhone, setTherapistPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Load existing profile from SQLite on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getUserProfile();
        if (profile) {
          setId(profile.id);
          setName(profile.name);
          setEmail(profile.email);
          setPhone(profile.phone);
          setEmergencyContact(profile.emergencyContact);
          setEmergencyPhone(profile.emergencyPhone);
        }
      } catch (e) {
        console.error('Erro ao carregar perfil:', e);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (name.trim().length < 3) {
      Alert.alert('Atenção', 'Por favor, insira seu nome completo.');
      return;
    }

    try {
      await saveUserProfile({
        id: id,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        therapistPhone: therapistPhone.trim(),
        emergencyContact: emergencyContact.trim(),
        emergencyPhone: emergencyPhone.trim(),
      });
      Alert.alert('Sucesso', 'Seus dados foram salvos com sucesso!');
    } catch (e) {
      console.error('Erro ao salvar perfil:', e);
      Alert.alert('Erro', 'Não foi possível salvar seus dados. Tente novamente.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Cadastro</Text>
          <Text style={styles.subtitle}>
            Preencha seus dados para personalizar sua experiência
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados Pessoais</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Seu nome"
              placeholderTextColor={colors.textLight}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor={colors.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              placeholderTextColor={colors.textLight}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone do terapeuta</Text>
            <TextInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              placeholderTextColor={colors.textLight}
              value={therapistPhone}
              onChangeText={setTherapistPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contato de Emergência</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do contato</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do contato"
              placeholderTextColor={colors.textLight}
              value={emergencyContact}
              onChangeText={setEmergencyContact}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone do contato</Text>
            <TextInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              placeholderTextColor={colors.textLight}
              value={emergencyPhone}
              onChangeText={setEmergencyPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.8}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Salvar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.l,
    paddingTop: 60,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xlarge,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.medium,
    color: colors.textLight,
    lineHeight: 24,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.m,
    padding: spacing.l,
    marginBottom: spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.m,
  },
  inputGroup: {
    marginBottom: spacing.m,
  },
  label: {
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.s,
    paddingHorizontal: spacing.m,
    paddingVertical: 14,
    fontSize: typography.sizes.small,
    color: colors.text,
    borderWidth: 1,
    borderColor: 'rgba(188, 160, 220, 0.3)',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.m,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.s,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
});
