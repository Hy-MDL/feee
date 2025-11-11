'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, RotateCcw, FastForward, Rewind, Calendar, TrendingUp, Activity, Clock, Zap } from 'lucide-react';
import { Card, Button } from '@/components/ui/DesignSystem';
import { useMacroStore } from '@/lib/store/macroStore';
import { useLevelStore } from '@/lib/store/levelStore';
import {
  runDateBasedSimulation,
  interpolateSnapshots,
  DateSnapshot,
  DateSimulationConfig,
  EntitySnapshot,
} from '@/lib/utils/dateBasedSimulation';

/**
 * Date-Based Simulator
 *
 * 실제 날짜를 사용하여 시간에 따른 경제 변화를 시뮬레이션하고
 * Globe3D/ForceNetworkGraph3D에 실시간으로 반영합니다.
 */

interface DateSimulatorProps {
  onSnapshotChange?: (snapshot: DateSnapshot) => void;
}

export default function DateSimulator({ onSnapshotChange }: DateSimulatorProps) {
  const macroState = useMacroStore((state) => state.macroState);
  const levelState = useLevelStore((state) => state.levelState);

  // Simulation config
  const [startDate, setStartDate] = useState<Date>(new Date('2024-01-01'));
  const [endDate, setEndDate] = useState<Date>(new Date('2024-12-31'));
  const [intervalDays, setIntervalDays] = useState(30); // 1개월 간격
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  // Simulation state
  const [snapshots, setSnapshots] = useState<DateSnapshot[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(Date.now());

  // 현재 스냅샷
  const currentSnapshot = snapshots[currentIndex] || null;

  // 시뮬레이션 실행
  const runSimulation = () => {
    console.log('Running date-based simulation...');

    const config: DateSimulationConfig = {
      startDate,
      endDate,
      intervalDays,
      volatility: 0.15,
      growthRate: 0.10, // 연간 10% 성장
      randomness: 0.1,
    };

    const results = runDateBasedSimulation(macroState, levelState, config);
    setSnapshots(results);
    setCurrentIndex(0);
    setIsPlaying(false);

    if (results.length > 0 && onSnapshotChange) {
      onSnapshotChange(results[0]);
    }
  };

  // 초기 시뮬레이션
  useEffect(() => {
    runSimulation();
  }, []); // 최초 1회만

  // Smooth animation state
  const [interpolationProgress, setInterpolationProgress] = useState(0);
  const animationStartTime = useRef<number>(0);

  // 재생 루프 (smooth interpolation)
  useEffect(() => {
    if (!isPlaying || snapshots.length === 0) return;

    const animate = () => {
      const now = Date.now();

      if (animationStartTime.current === 0) {
        animationStartTime.current = now;
      }

      // Calculate progress for smooth interpolation
      const elapsed = now - animationStartTime.current;
      const duration = (1000 / playbackSpeed); // Duration for one transition
      const progress = Math.min(elapsed / duration, 1);

      setInterpolationProgress(progress);

      // Interpolate between current and next snapshot
      if (progress >= 1) {
        // Move to next snapshot
        setCurrentIndex((prev) => {
          const next = prev + 1;
          if (next >= snapshots.length) {
            setIsPlaying(false);
            return prev;
          }

          // Send the next snapshot (not interpolated)
          if (onSnapshotChange) {
            onSnapshotChange(snapshots[next]);
          }

          return next;
        });

        animationStartTime.current = 0;
        setInterpolationProgress(0);
      } else if (onSnapshotChange && currentIndex < snapshots.length - 1) {
        // Send interpolated snapshot
        const interpolated = interpolateSnapshots(
          snapshots[currentIndex],
          snapshots[currentIndex + 1],
          progress
        );
        onSnapshotChange(interpolated);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, snapshots, currentIndex, onSnapshotChange]);

  // 재생/일시정지
  const togglePlayback = () => {
    if (currentIndex >= snapshots.length - 1) {
      setCurrentIndex(0);
      if (onSnapshotChange && snapshots.length > 0) {
        onSnapshotChange(snapshots[0]);
      }
    }
    setIsPlaying(!isPlaying);
    lastUpdateRef.current = Date.now();
  };

  // 리셋
  const resetSimulation = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
    if (snapshots.length > 0 && onSnapshotChange) {
      onSnapshotChange(snapshots[0]);
    }
  };

  // 수동 날짜 변경
  const handleIndexChange = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
    if (onSnapshotChange && snapshots[index]) {
      onSnapshotChange(snapshots[index]);
    }
  };

  // 앞으로/뒤로
  const stepForward = () => {
    if (currentIndex < snapshots.length - 1) {
      handleIndexChange(currentIndex + 1);
    }
  };

  const stepBackward = () => {
    if (currentIndex > 0) {
      handleIndexChange(currentIndex - 1);
    }
  };

  // 진행률
  const progress = snapshots.length > 1 ? (currentIndex / (snapshots.length - 1)) * 100 : 0;

  // 주요 이벤트
  const recentEvents = currentSnapshot?.events.slice(0, 5) || [];

  // 성장 중인 엔티티
  const growingEntities = useMemo(() => {
    if (!currentSnapshot) return [];
    const growing: EntitySnapshot[] = [];
    currentSnapshot.entityValues.forEach((entity) => {
      if (entity.isGrowing && entity.changeRate > 0.05) {
        growing.push(entity);
      }
    });
    return growing.sort((a, b) => b.changeRate - a.changeRate).slice(0, 5);
  }, [currentSnapshot]);

  return (
    <div className="space-y-4">
      {/* Main Card */}
      <Card className="bg-background-primary border-2 border-accent-emerald/30">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-emerald/10 flex items-center justify-center">
              <Calendar size={20} className="text-accent-emerald" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Date-Based Simulation</h3>
              <p className="text-xs text-text-tertiary">
                {snapshots.length} periods · Real-time economic evolution
              </p>
            </div>
          </div>

          <Button variant="secondary" size="sm" onClick={runSimulation}>
            <RotateCcw size={14} className="mr-1" />
            Re-run
          </Button>
        </div>

        {/* Current Date Display */}
        {currentSnapshot && (
          <div className="bg-background-secondary rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs text-text-tertiary mb-1">Current Date</div>
                <div className="text-3xl font-bold text-accent-emerald font-mono">
                  {currentSnapshot.date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-text-tertiary mb-1">Period</div>
                <div className="text-xl font-bold text-text-primary">
                  {currentIndex + 1} / {snapshots.length}
                </div>
              </div>
            </div>
            <div className="text-xs text-text-secondary">{currentSnapshot.description}</div>
          </div>
        )}

        {/* Timeline Slider */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-text-tertiary font-mono">
              {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <div className="flex-1 relative">
              <input
                type="range"
                min={0}
                max={snapshots.length - 1}
                value={currentIndex}
                onChange={(e) => handleIndexChange(parseInt(e.target.value))}
                className="w-full h-2 bg-background-tertiary rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #10B981 ${progress}%, #27272E ${progress}%)`,
                }}
              />
              {/* Date markers */}
              <div className="flex justify-between mt-1">
                {snapshots.map((snapshot, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx <= currentIndex ? 'bg-accent-emerald' : 'bg-border-primary'
                    }`}
                    title={snapshot.date.toLocaleDateString()}
                  />
                ))}
              </div>
            </div>
            <span className="text-xs text-text-tertiary font-mono">
              {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={resetSimulation}
              className="w-8 h-8 rounded bg-background-secondary hover:bg-background-tertiary transition-colors flex items-center justify-center text-text-secondary hover:text-text-primary"
              title="Reset"
            >
              <RotateCcw size={16} />
            </button>

            <button
              onClick={stepBackward}
              disabled={currentIndex === 0}
              className="w-8 h-8 rounded bg-background-secondary hover:bg-background-tertiary transition-colors flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
              title="Previous Period"
            >
              <Rewind size={16} />
            </button>

            <button
              onClick={togglePlayback}
              className="w-10 h-10 rounded-full bg-accent-emerald hover:bg-accent-emerald/80 transition-colors flex items-center justify-center text-black font-bold"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <button
              onClick={stepForward}
              disabled={currentIndex === snapshots.length - 1}
              className="w-8 h-8 rounded bg-background-secondary hover:bg-background-tertiary transition-colors flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next Period"
            >
              <FastForward size={16} />
            </button>
          </div>

          {/* Playback Speed */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-tertiary">Speed:</span>
            <div className="flex gap-1">
              {[0.5, 1.0, 2.0, 5.0].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    playbackSpeed === speed
                      ? 'bg-accent-emerald text-black'
                      : 'bg-background-secondary text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-background-secondary rounded-lg p-3">
            <div className="text-xs text-text-tertiary mb-1">Interval</div>
            <div className="text-lg font-bold text-accent-cyan">{intervalDays} days</div>
          </div>
          <div className="bg-background-secondary rounded-lg p-3">
            <div className="text-xs text-text-tertiary mb-1">Events</div>
            <div className="text-lg font-bold text-accent-magenta">{recentEvents.length}</div>
          </div>
          <div className="bg-background-secondary rounded-lg p-3">
            <div className="text-xs text-text-tertiary mb-1">Volatility</div>
            <div className="text-lg font-bold text-accent-emerald">15%</div>
          </div>
        </div>
      </Card>

      {/* Events & Growing Entities */}
      <div className="grid grid-cols-2 gap-4">
        {/* Events */}
        {recentEvents.length > 0 && (
          <Card className="bg-background-secondary">
            <div className="text-xs font-semibold text-text-secondary mb-3 flex items-center gap-2">
              <Zap size={12} className="text-accent-magenta" />
              Recent Events ({recentEvents.length})
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {recentEvents.map((event, idx) => (
                <div
                  key={idx}
                  className={`text-xs p-2 rounded border ${
                    event.impact === 'positive'
                      ? 'bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald'
                      : event.impact === 'negative'
                      ? 'bg-red-500/10 border-red-500/30 text-red-400'
                      : 'bg-background-tertiary border-border-primary text-text-secondary'
                  }`}
                >
                  <div className="font-semibold mb-1">{event.title}</div>
                  <div className="text-xs opacity-80">{event.description}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Growing Entities */}
        {growingEntities.length > 0 && (
          <Card className="bg-background-secondary">
            <div className="text-xs font-semibold text-text-secondary mb-3 flex items-center gap-2">
              <TrendingUp size={12} className="text-accent-emerald" />
              Top Performers
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {growingEntities.map((entity, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs p-2 bg-background-tertiary rounded"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-text-primary truncate">
                      {entity.entityName}
                    </div>
                    <div className="text-text-tertiary text-xs">{entity.entityType}</div>
                  </div>
                  <div className="text-accent-emerald font-bold font-mono">
                    +{(entity.changeRate * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
