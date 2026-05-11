import { useState, useCallback } from 'react';
import { PlayerAction, GameState } from '@shared/types';

export function useGameState(myCountryId: string | null) {
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | null>(null);
  const [pendingActions, setPendingActions] = useState<PlayerAction[]>([]);
  const [activeTab, setActiveTab] = useState<'country' | 'territory' | 'diplomacy' | 'research' | 'production'>('country');

  // Click only selects for viewing — no attack flow
  const handleTerritoryClick = useCallback((territoryId: string, gameState: GameState | null) => {
    if (!gameState) return;
    if (!gameState.territories[territoryId]) return;
    setSelectedTerritoryId(prev => prev === territoryId ? null : territoryId);
    setActiveTab('territory');
  }, []);

  function addAction(action: PlayerAction) {
    setPendingActions(prev => [...prev, action]);
  }

  function removeAction(index: number) {
    setPendingActions(prev => prev.filter((_, i) => i !== index));
  }

  function clearActions() {
    setPendingActions([]);
  }

  function clearSelection() {
    setSelectedTerritoryId(null);
  }

  return {
    selectedTerritoryId,
    pendingActions,
    activeTab, setActiveTab,
    handleTerritoryClick,
    addAction, removeAction, clearActions, clearSelection,
  };
}
