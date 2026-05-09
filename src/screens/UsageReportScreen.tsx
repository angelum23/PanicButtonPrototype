import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../theme';
import {
  getUsageReportData,
  getUserProfile,
  UsageReportData,
  UserProfile,
} from '../db/database';

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(seconds: number | null): string {
  if (seconds === null || isNaN(seconds)) return '—';
  const secs = Math.round(seconds);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const remSecs = secs % 60;
  return `${mins}min ${remSecs}s`;
}

function getTypeEmoji(type: string): string {
  switch (type) {
    case 'Respiração':
      return '🫁';
    case 'Grounding':
      return '🌿';
    case 'Relaxamento':
      return '💪';
    case 'Avaliação':
      return '🌟';
    default:
      return '📋';
  }
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'Respiração':
      return '#7E57C2';
    case 'Grounding':
      return '#66BB6A';
    case 'Relaxamento':
      return '#42A5F5';
    case 'Avaliação':
      return '#FFA726';
    default:
      return colors.primary;
  }
}

/** Simple horizontal bar component */
function Bar({ value, maxValue, color }: { value: number; maxValue: number; color: string }) {
  const width = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <View style={barStyles.track}>
      <View style={[barStyles.fill, { width: `${Math.max(width, 4)}%`, backgroundColor: color }]} />
    </View>
  );
}

const barStyles = StyleSheet.create({
  track: {
    flex: 1,
    height: 14,
    backgroundColor: 'rgba(188, 160, 220, 0.15)',
    borderRadius: 7,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 7,
    minWidth: 6,
  },
});

export default function UsageReportScreen() {
  const navigation = useNavigation();
  const [data, setData] = useState<UsageReportData | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [reportData, userProfile] = await Promise.all([
          getUsageReportData(),
          getUserProfile(),
        ]);
        setData(reportData);
        setProfile(userProfile);
      } catch (e) {
        console.error('Erro ao carregar dados do relatório:', e);
        Alert.alert('Erro', 'Não foi possível carregar os dados do relatório.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const generateTextReport = useCallback((): string => {
    if (!data) return '';

    const totalSessions =
      data.totalBreathingSessions +
      data.totalGroundingSessions +
      data.totalRelaxationSessions;

    const lines: string[] = [
      '═══════════════════════════════════',
      '   RELATÓRIO DE USO — PanicButtonPrototype',
      '═══════════════════════════════════',
      '',
      `Paciente: ${profile?.name || 'Não informado'}`,
      `Período: ${formatDate(data.firstSessionDate)} a ${formatDate(data.lastSessionDate)}`,
      `Data do relatório: ${formatDate(new Date().toISOString())}`,
      '',
      '── RESUMO GERAL ──────────────────',
      `Total de sessões: ${totalSessions}`,
      `  • Respiração: ${data.totalBreathingSessions}`,
      `  • Grounding: ${data.totalGroundingSessions}`,
      `  • Relaxamento: ${data.totalRelaxationSessions}`,
      `  • Avaliações registradas: ${data.totalRatingSessions}`,
      '',
      '── DURAÇÃO MÉDIA ─────────────────',
      `  • Respiração: ${formatDuration(data.avgBreathingDurationSec)}`,
      `  • Relaxamento: ${formatDuration(data.avgRelaxationDurationSec)}`,
      '',
    ];

    if (data.avgRating !== null) {
      lines.push('── AVALIAÇÕES DE ANSIEDADE ───────');
      lines.push(`  Média: ${data.avgRating.toFixed(1)}/10`);
      lines.push(`  Mínima: ${data.minRating}/10`);
      lines.push(`  Máxima: ${data.maxRating}/10`);
      lines.push('');
      lines.push('  Distribuição:');
      for (const r of data.ratingDistribution) {
        const bar = '█'.repeat(r.count);
        lines.push(`    ${r.rating.toString().padStart(2, ' ')}/10: ${bar} (${r.count})`);
      }
      lines.push('');
    }

    if (data.avgGroundingItemsCompleted !== null) {
      lines.push('── GROUNDING (5-4-3-2-1) ────────');
      lines.push(`  Itens completados em média: ${data.avgGroundingItemsCompleted.toFixed(1)}/5`);
      lines.push('');
    }

    if (data.sessionsPerDayOfWeek.length > 0) {
      lines.push('── FREQUÊNCIA POR DIA DA SEMANA ──');
      for (const d of data.sessionsPerDayOfWeek) {
        lines.push(`  ${DAY_LABELS[d.day]}: ${d.count} sessões`);
      }
      lines.push('');
    }

    if (data.recentTimeline.length > 0) {
      lines.push('── ÚLTIMAS ATIVIDADES ────────────');
      for (const t of data.recentTimeline.slice(0, 10)) {
        lines.push(`  ${formatDateTime(t.date)} | ${t.type} — ${t.detail}`);
      }
      lines.push('');
    }

    lines.push('═══════════════════════════════════');
    lines.push('Gerado automaticamente por PanicButtonPrototype');
    lines.push('Este relatório é confidencial.');

    return lines.join('\n');
  }, [data, profile]);

  const handleShare = useCallback(async () => {
    try {
      const text = generateTextReport();
      await Share.share({
        message: text,
        title: 'Relatório de Uso — PanicButtonPrototype',
      });
    } catch (e) {
      console.error('Erro ao compartilhar:', e);
      Alert.alert('Erro', 'Não foi possível compartilhar o relatório.');
    }
  }, [generateTextReport]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Gerando relatório...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Nenhum dado disponível.</Text>
      </View>
    );
  }

  const totalSessions =
    data.totalBreathingSessions +
    data.totalGroundingSessions +
    data.totalRelaxationSessions;
  const maxRatingCount = Math.max(...data.ratingDistribution.map((r) => r.count), 1);
  const maxDayCount = Math.max(...data.sessionsPerDayOfWeek.map((d) => d.count), 1);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Relatório de Uso</Text>
        <Text style={styles.headerSubtitle}>Dados para acompanhamento terapêutico</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Patient & Period info */}
        <View style={styles.periodCard}>
          <View style={styles.periodRow}>
            <Text style={styles.periodLabel}>Paciente</Text>
            <Text style={styles.periodValue}>{profile?.name || 'Não informado'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.periodRow}>
            <Text style={styles.periodLabel}>Período</Text>
            <Text style={styles.periodValue}>
              {formatDate(data.firstSessionDate)} — {formatDate(data.lastSessionDate)}
            </Text>
          </View>
        </View>

        {/* Summary cards */}
        <Text style={styles.sectionTitle}>📊 Resumo de Sessões</Text>
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, { borderLeftColor: '#7E57C2' }]}>
            <Text style={styles.summaryNumber}>{data.totalBreathingSessions}</Text>
            <Text style={styles.summaryLabel}>Respiração</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: '#66BB6A' }]}>
            <Text style={styles.summaryNumber}>{data.totalGroundingSessions}</Text>
            <Text style={styles.summaryLabel}>Grounding</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: '#42A5F5' }]}>
            <Text style={styles.summaryNumber}>{data.totalRelaxationSessions}</Text>
            <Text style={styles.summaryLabel}>Relaxamento</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: '#FFA726' }]}>
            <Text style={styles.summaryNumber}>{data.totalRatingSessions}</Text>
            <Text style={styles.summaryLabel}>Avaliações</Text>
          </View>
        </View>

        {/* Duration averages */}
        <Text style={styles.sectionTitle}>⏱ Duração Média</Text>
        <View style={styles.infoCard}>
          <View style={styles.durationRow}>
            <Text style={styles.durationLabel}>🫁 Respiração</Text>
            <Text style={styles.durationValue}>
              {formatDuration(data.avgBreathingDurationSec)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.durationRow}>
            <Text style={styles.durationLabel}>💪 Relaxamento</Text>
            <Text style={styles.durationValue}>
              {formatDuration(data.avgRelaxationDurationSec)}
            </Text>
          </View>
          {data.avgGroundingItemsCompleted !== null && (
            <>
              <View style={styles.divider} />
              <View style={styles.durationRow}>
                <Text style={styles.durationLabel}>🌿 Itens Grounding</Text>
                <Text style={styles.durationValue}>
                  {data.avgGroundingItemsCompleted.toFixed(1)}/5 em média
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Rating distribution */}
        {data.ratingDistribution.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>📈 Avaliações de Ansiedade</Text>
            <View style={styles.infoCard}>
              <View style={styles.ratingStatsRow}>
                <View style={styles.ratingStat}>
                  <Text style={styles.ratingStatValue}>
                    {data.avgRating?.toFixed(1) ?? '—'}
                  </Text>
                  <Text style={styles.ratingStatLabel}>Média</Text>
                </View>
                <View style={styles.ratingStat}>
                  <Text style={[styles.ratingStatValue, { color: colors.success }]}>
                    {data.minRating ?? '—'}
                  </Text>
                  <Text style={styles.ratingStatLabel}>Mínima</Text>
                </View>
                <View style={styles.ratingStat}>
                  <Text style={[styles.ratingStatValue, { color: colors.error }]}>
                    {data.maxRating ?? '—'}
                  </Text>
                  <Text style={styles.ratingStatLabel}>Máxima</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <Text style={styles.chartTitle}>Distribuição das notas</Text>
              {data.ratingDistribution.map((r) => (
                <View key={r.rating} style={styles.barRow}>
                  <Text style={styles.barLabel}>{r.rating}</Text>
                  <Bar
                    value={r.count}
                    maxValue={maxRatingCount}
                    color={r.rating <= 3 ? '#66BB6A' : r.rating <= 6 ? '#FFA726' : '#EF5350'}
                  />
                  <Text style={styles.barCount}>{r.count}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Weekly frequency */}
        {data.sessionsPerDayOfWeek.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>📅 Frequência Semanal</Text>
            <View style={styles.infoCard}>
              {DAY_LABELS.map((label, idx) => {
                const found = data.sessionsPerDayOfWeek.find((d) => d.day === idx);
                const count = found?.count ?? 0;
                return (
                  <View key={idx} style={styles.barRow}>
                    <Text style={styles.barLabel}>{label}</Text>
                    <Bar value={count} maxValue={maxDayCount} color={colors.primary} />
                    <Text style={styles.barCount}>{count}</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Recent timeline */}
        {data.recentTimeline.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>🕐 Atividades Recentes</Text>
            <View style={styles.infoCard}>
              {data.recentTimeline.map((t, idx) => (
                <View key={idx}>
                  {idx > 0 && <View style={styles.divider} />}
                  <View style={styles.timelineItem}>
                    <View
                      style={[
                        styles.timelineDot,
                        { backgroundColor: getTypeColor(t.type) },
                      ]}
                    >
                      <Text style={styles.timelineEmoji}>{getTypeEmoji(t.type)}</Text>
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineType}>{t.type}</Text>
                      <Text style={styles.timelineDetail}>{t.detail}</Text>
                      <Text style={styles.timelineDate}>{formatDateTime(t.date)}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Empty state */}
        {totalSessions === 0 && data.totalRatingSessions === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>Nenhum dado registrado</Text>
            <Text style={styles.emptyText}>
              Use as ferramentas de respiração, grounding e relaxamento para gerar dados do relatório.
            </Text>
          </View>
        )}

        {/* Spacer before share button */}
        <View style={{ height: spacing.l }} />
      </ScrollView>

      {/* Share button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>📤 Compartilhar relatório</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.m,
    fontSize: typography.sizes.medium,
    color: colors.textLight,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.m,
    backgroundColor: colors.white,
    borderBottomLeftRadius: borderRadius.l,
    borderBottomRightRadius: borderRadius.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    marginBottom: spacing.s,
  },
  backText: {
    fontSize: typography.sizes.small,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  headerTitle: {
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.sizes.small,
    color: colors.textLight,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.l,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: spacing.l,
    marginBottom: spacing.m,
  },
  periodCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.m,
    padding: spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodLabel: {
    fontSize: typography.sizes.small,
    color: colors.textLight,
    fontWeight: typography.weights.medium,
  },
  periodValue: {
    fontSize: typography.sizes.small,
    color: colors.text,
    fontWeight: typography.weights.bold,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(188, 160, 220, 0.15)',
    marginVertical: spacing.m,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.m,
    padding: spacing.m,
    width: '48%',
    marginBottom: spacing.m,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.m,
    padding: spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationLabel: {
    fontSize: typography.sizes.small,
    color: colors.text,
  },
  durationValue: {
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  ratingStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.s,
  },
  ratingStat: {
    alignItems: 'center',
  },
  ratingStatValue: {
    fontSize: 28,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  ratingStatLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  chartTitle: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: spacing.m,
    fontWeight: typography.weights.medium,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  barLabel: {
    width: 32,
    fontSize: 13,
    color: colors.text,
    fontWeight: typography.weights.medium,
    textAlign: 'right',
    marginRight: spacing.s,
  },
  barCount: {
    width: 28,
    fontSize: 13,
    color: colors.textLight,
    textAlign: 'center',
    marginLeft: spacing.s,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
    marginTop: 2,
  },
  timelineEmoji: {
    fontSize: 16,
  },
  timelineContent: {
    flex: 1,
  },
  timelineType: {
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  timelineDetail: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2,
  },
  timelineDate: {
    fontSize: 12,
    color: 'rgba(122, 107, 139, 0.6)',
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.m,
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.m,
  },
  emptyTitle: {
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.s,
  },
  emptyText: {
    fontSize: typography.sizes.small,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.l,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.l,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(188, 160, 220, 0.15)',
  },
  shareButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.m,
    paddingVertical: spacing.m,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  shareButtonText: {
    color: colors.white,
    fontSize: typography.sizes.medium,
    fontWeight: typography.weights.bold,
  },
});
