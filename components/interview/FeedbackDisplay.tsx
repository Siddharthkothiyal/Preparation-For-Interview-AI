import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { FuturisticButton } from '../FuturisticButton';
import { FeedbackData } from '@/services/FeedbackService';

interface FeedbackDisplayProps {
  feedbackData: FeedbackData;
  overallScore: number;
  onNewInterview: () => void;
  onReadFeedback: () => void;
}

export function FeedbackDisplay({ 
  feedbackData, 
  overallScore, 
  onNewInterview,
  onReadFeedback 
}: FeedbackDisplayProps) {
  const renderSkillBar = (skill: string, value: number) => {
    return (
      <View style={styles.skillBarContainer}>
        <ThemedText style={styles.skillLabel}>{skill}</ThemedText>
        <View style={styles.barBackground}>
          <LinearGradient
            colors={['#00E5FF', '#0077FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.barFill, { width: `${value * 10}%` }]}
          />
        </View>
        <ThemedText style={styles.skillValue}>{value}/10</ThemedText>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Interview Feedback</ThemedText>
      
      <ThemedView style={styles.scoreContainer}>
        <ThemedText style={styles.scoreLabel}>Overall Score</ThemedText>
        <ThemedText style={styles.scoreValue}>{overallScore}/100</ThemedText>
      </ThemedView>
      
      <ThemedText type="subtitle" style={styles.sectionTitle}>Communication Skills</ThemedText>
      
      {renderSkillBar('Tone', feedbackData.tone)}
      {renderSkillBar('Clarity', feedbackData.clarity)}
      {renderSkillBar('Vocabulary', feedbackData.vocabulary)}
      {renderSkillBar('Pacing', feedbackData.pacing)}
      {renderSkillBar('Confidence', feedbackData.confidence)}
      
      <ThemedText type="subtitle" style={styles.sectionTitle}>Detailed Feedback</ThemedText>
      <ThemedText style={styles.feedbackText}>{feedbackData.feedback}</ThemedText>
      
      <View style={styles.buttonContainer}>
        <FuturisticButton
          title="Read Feedback Aloud"
          onPress={onReadFeedback}
          variant="secondary"
          style={styles.button}
        />
        <FuturisticButton
          title="New Interview"
          onPress={onNewInterview}
          variant="primary"
          style={styles.button}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 15,
    backgroundColor: 'rgba(26, 31, 53, 0.8)',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  scoreLabel: {
    color: 'white',
    fontSize: 16,
  },
  scoreValue: {
    color: '#00E5FF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: 'white',
    marginTop: 15,
    marginBottom: 10,
  },
  skillBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  skillLabel: {
    color: 'white',
    width: 100,
  },
  barBackground: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  skillValue: {
    color: 'white',
    width: 50,
    textAlign: 'right',
  },
  feedbackText: {
    color: 'white',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});