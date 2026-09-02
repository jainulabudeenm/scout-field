import type { MainToUI, UIToMain } from '../shared/messages';
import { annotate } from './annotate';
import { buildBoard } from './board';
import { capture, describeSelection } from './capture';
import { clearRuns, loadRuns, loadSettings, recordRun, saveSettings } from './storage';

const post = (msg: MainToUI) => figma.ui.postMessage(msg);

figma.showUI(__html__, { width: 460, height: 680, themeColors: true });

figma.ui.onmessage = async (msg: UIToMain) => {
  try {
    switch (msg.type) {
      case 'ui-ready':
        post({ type: 'ready', settings: await loadSettings(), selection: describeSelection() });
        post({ type: 'runs', runs: await loadRuns() });
        break;
      case 'capture':
        post({ type: 'capture', capture: await capture() });
        break;
      case 'annotate':
        try {
          post({ type: 'annotated', count: await annotate(msg.findings, msg.scale, msg.replace) });
        } catch (err) {
          post({ type: 'annotated', count: -1, note: (err as Error).message });
        }
        break;
      case 'board':
        try {
          const built = await buildBoard(msg.data);
          post({ type: 'board-built', total: built.total, shown: built.shown });
        } catch (err) {
          post({ type: 'board-built', total: 0, shown: 0, note: (err as Error).message });
        }
        break;
      case 'record-run':
        post({ type: 'runs', runs: await recordRun(msg.run) });
        break;
      case 'clear-runs':
        await clearRuns();
        post({ type: 'runs', runs: [] });
        break;
      case 'save-settings':
        await saveSettings(msg.settings);
        post({ type: 'settings-saved' });
        break;
      case 'close':
        figma.closePlugin();
        break;
    }
  } catch (err) {
    post({ type: 'error', message: (err as Error).message });
  }
};

figma.on('selectionchange', () => post({ type: 'selection-changed', selection: describeSelection() }));
