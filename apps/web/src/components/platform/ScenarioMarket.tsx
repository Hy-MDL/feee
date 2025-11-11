'use client';

import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, ThumbsUp, ThumbsDown, Check, Users, Activity } from 'lucide-react';
import { useScenarioStore, Scenario } from '@/lib/store/scenarioStore';
import { useMacroStore } from '@/lib/store/macroStore';
import { useLevelStore } from '@/lib/store/levelStore';

/**
 * Poly Market Style Scenario Selection
 *
 * Community scenarios with voting and probability display
 */

interface ScenarioMarketProps {
  onScenarioSelect?: (scenario: Scenario) => void;
}

export default function ScenarioMarket({ onScenarioSelect }: ScenarioMarketProps) {
  const { getAllScenarios, getPublicScenarios, updateScenario, currentScenarioId, setCurrentScenario } = useScenarioStore();
  const setMacroState = useMacroStore(state => state.setMacroState);
  const setLevelState = useLevelStore(state => state.setLevelState);

  const publicScenarios = getPublicScenarios();
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down' | null>>({});

  // Calculate probability-like percentage based on votes
  const calculateConfidence = (scenario: Scenario): number => {
    const up = scenario.upvotes || 0;
    const down = scenario.downvotes || 0;
    const total = up + down;

    if (total === 0) return 50; // Neutral
    return Math.round((up / total) * 100);
  };

  // Sort scenarios by confidence
  const sortedScenarios = useMemo(() => {
    return [...publicScenarios].sort((a, b) => {
      const confA = calculateConfidence(a);
      const confB = calculateConfidence(b);
      return confB - confA;
    });
  }, [publicScenarios]);

  const handleVote = (scenarioId: string, voteType: 'up' | 'down') => {
    const scenario = publicScenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    const currentVote = userVotes[scenarioId];
    let newUpvotes = scenario.upvotes || 0;
    let newDownvotes = scenario.downvotes || 0;

    // Remove previous vote if exists
    if (currentVote === 'up') newUpvotes--;
    if (currentVote === 'down') newDownvotes--;

    // Add new vote if different from current
    if (currentVote !== voteType) {
      if (voteType === 'up') newUpvotes++;
      else newDownvotes++;
      setUserVotes({ ...userVotes, [scenarioId]: voteType });
    } else {
      // Clicking same vote removes it
      setUserVotes({ ...userVotes, [scenarioId]: null });
    }

    updateScenario(scenarioId, {
      upvotes: newUpvotes,
      downvotes: newDownvotes,
    });
  };

  const handleScenarioSelect = (scenario: Scenario) => {
    // Apply scenario to stores
    setMacroState(scenario.macroState);
    if (scenario.levelState) {
      setLevelState(scenario.levelState);
    }
    setCurrentScenario(scenario.id);

    if (onScenarioSelect) {
      onScenarioSelect(scenario);
    }
  };

  return (
    <div className="bg-[#0D0D0F] border border-[#1A1A1F] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Activity size={16} className="text-accent-magenta" />
            선호도 (평판)
          </h3>
          <p className="text-xs text-text-tertiary mt-1">
            Community scenarios - Vote on economic forecasts
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-text-tertiary">Total Scenarios</div>
          <div className="text-lg font-bold text-accent-cyan">{sortedScenarios.length}</div>
        </div>
      </div>

      {/* Scenario List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {sortedScenarios.length === 0 ? (
          <div className="text-center py-8 text-text-tertiary text-xs">
            No community scenarios yet. Create and share yours in Community!
          </div>
        ) : (
          sortedScenarios.map((scenario) => {
            const confidence = calculateConfidence(scenario);
            const isSelected = currentScenarioId === scenario.id;
            const userVote = userVotes[scenario.id];
            const totalVotes = (scenario.upvotes || 0) + (scenario.downvotes || 0);

            return (
              <button
                key={scenario.id}
                onClick={() => handleScenarioSelect(scenario)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-accent-emerald bg-accent-emerald/5'
                    : 'border-border-primary hover:border-accent-cyan/50 bg-background-secondary'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {scenario.icon && (
                        <span className="text-lg">{scenario.icon}</span>
                      )}
                      <h4 className="text-sm font-semibold text-text-primary truncate">
                        {scenario.name}
                      </h4>
                      {isSelected && (
                        <Check size={14} className="text-accent-emerald flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-2">
                      {scenario.description}
                    </p>
                  </div>

                  {/* Confidence Bar */}
                  <div className="ml-3 text-right flex-shrink-0">
                    <div className={`text-xl font-bold font-mono ${
                      confidence >= 70 ? 'text-accent-emerald' :
                      confidence >= 50 ? 'text-accent-cyan' :
                      'text-red-400'
                    }`}>
                      {confidence}%
                    </div>
                    <div className="text-xs text-text-tertiary">
                      {confidence >= 70 ? 'High' : confidence >= 50 ? 'Medium' : 'Low'}
                    </div>
                  </div>
                </div>

                {/* Confidence Progress Bar */}
                <div className="relative h-1.5 bg-background-tertiary rounded-full overflow-hidden mb-2">
                  <div
                    className={`absolute left-0 top-0 h-full transition-all duration-300 ${
                      confidence >= 70 ? 'bg-accent-emerald' :
                      confidence >= 50 ? 'bg-accent-cyan' :
                      'bg-red-400'
                    }`}
                    style={{ width: `${confidence}%` }}
                  />
                </div>

                {/* Tags & Votes */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 flex-wrap">
                    {scenario.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-background-tertiary text-text-tertiary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Vote Buttons */}
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleVote(scenario.id, 'up')}
                      className={`flex items-center gap-1 px-2 py-1 rounded transition-all ${
                        userVote === 'up'
                          ? 'bg-accent-emerald/20 text-accent-emerald'
                          : 'hover:bg-background-tertiary text-text-tertiary hover:text-accent-emerald'
                      }`}
                    >
                      <ThumbsUp size={12} />
                      <span className="text-xs font-mono">{scenario.upvotes || 0}</span>
                    </button>
                    <button
                      onClick={() => handleVote(scenario.id, 'down')}
                      className={`flex items-center gap-1 px-2 py-1 rounded transition-all ${
                        userVote === 'down'
                          ? 'bg-red-500/20 text-red-400'
                          : 'hover:bg-background-tertiary text-text-tertiary hover:text-red-400'
                      }`}
                    >
                      <ThumbsDown size={12} />
                      <span className="text-xs font-mono">{scenario.downvotes || 0}</span>
                    </button>
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-center gap-1 mt-2 text-xs text-text-tertiary">
                  <Users size={10} />
                  <span>by {scenario.createdBy}</span>
                  {scenario.isVerified && (
                    <span className="text-accent-cyan">✓</span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Bottom Stats */}
      <div className="mt-4 pt-4 border-t border-border-primary">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs text-text-tertiary mb-1">Your Votes</div>
            <div className="text-sm font-bold text-accent-cyan">
              {Object.values(userVotes).filter(v => v !== null).length}
            </div>
          </div>
          <div>
            <div className="text-xs text-text-tertiary mb-1">Total Votes</div>
            <div className="text-sm font-bold text-text-primary">
              {sortedScenarios.reduce((sum, s) => sum + ((s.upvotes || 0) + (s.downvotes || 0)), 0)}
            </div>
          </div>
          <div>
            <div className="text-xs text-text-tertiary mb-1">Active</div>
            <div className="text-sm font-bold text-accent-emerald">
              {sortedScenarios.filter(s => calculateConfidence(s) >= 60).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
