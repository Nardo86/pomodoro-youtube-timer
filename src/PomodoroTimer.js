import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Typography,
  Box,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Fab,
  Tooltip,
  Chip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CircleIcon from '@mui/icons-material/Circle';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import ReplayIcon from '@mui/icons-material/Replay';
import SkipNextIcon from '@mui/icons-material/SkipNext';

const AnalogClock = ({ remainingSeconds, totalSeconds }) => {
  const theme = useTheme();
  const safeTotal = totalSeconds > 0 ? totalSeconds : 1;
  const clampedRemaining = Math.max(0, Math.min(remainingSeconds, safeTotal));
  const remainingRatio = clampedRemaining / safeTotal;
  const elapsedAngle = (1 - remainingRatio) * 360;
  const minuteRotation = elapsedAngle;
  const elapsedSeconds = safeTotal - clampedRemaining;
  const secondRotation = elapsedSeconds * 6;
  const isPhaseReset = clampedRemaining === safeTotal;
  const trackColor = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
  const minuteColor = theme.palette.primary.main;
  const secondColor = theme.palette.secondary.main;
  const minuteHandTransition = isPhaseReset ? 'none' : 'transform 0.3s ease';
  const secondHandTransition = isPhaseReset ? 'none' : 'transform 0.1s linear';

  return (
    <Box
      sx={{
        position: 'relative',
        width: { xs: 220, sm: 260 },
        height: { xs: 220, sm: 260 },
        mx: 'auto',
        pointerEvents: 'none'
      }}
      aria-hidden="true"
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `conic-gradient(from 0deg, ${minuteColor} 0deg ${elapsedAngle}deg, ${trackColor} ${elapsedAngle}deg 360deg)`,
          transition: 'background 0.3s ease'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: '14%',
          borderRadius: '50%',
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.palette.mode === 'dark'
            ? 'inset 0 0 25px rgba(0,0,0,0.8)'
            : 'inset 0 0 25px rgba(0,0,0,0.15)'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 6,
          height: '35%',
          borderRadius: 3,
          backgroundColor: minuteColor,
          transformOrigin: 'center bottom',
          transform: `translate(-50%, -100%) rotate(${minuteRotation}deg)`,
          transition: minuteHandTransition,
          zIndex: 2
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 3,
          height: '40%',
          borderRadius: 2,
          backgroundColor: secondColor,
          transformOrigin: 'center bottom',
          transform: `translate(-50%, -100%) rotate(${secondRotation}deg)`,
          transition: secondHandTransition,
          zIndex: 3
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 14,
          height: 14,
          borderRadius: '50%',
          backgroundColor: secondColor,
          boxShadow: `0 0 12px ${secondColor}`,
          transform: 'translate(-50%, -50%)',
          zIndex: 4
        }}
      />
    </Box>
  );
};

const PomodoroTimer = ({ onWorkTimeChange, onTimerActiveChange, themeToggle }) => {
  const theme = useTheme();

  const loadSettings = () => {
    const saved = localStorage.getItem('pomodoroSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      return {
        workDuration: settings.workDuration || 25,
        breakDuration: settings.breakDuration || 5,
        longBreakDuration: settings.longBreakDuration || 15,
        cyclesBeforeLongBreak: settings.cyclesBeforeLongBreak || 4
      };
    }
    return {
      workDuration: 25,
      breakDuration: 5,
      longBreakDuration: 15,
      cyclesBeforeLongBreak: 4
    };
  };

  const initialSettings = loadSettings();
  const [minutes, setMinutes] = useState(initialSettings.workDuration);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isWorkTime, setIsWorkTime] = useState(true);
  const [workDuration, setWorkDuration] = useState(initialSettings.workDuration);
  const [breakDuration, setBreakDuration] = useState(initialSettings.breakDuration);
  const [longBreakDuration, setLongBreakDuration] = useState(initialSettings.longBreakDuration);
  const [cyclesBeforeLongBreak, setCyclesBeforeLongBreak] = useState(initialSettings.cyclesBeforeLongBreak);
  const [cycleCount, setCycleCount] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [currentPhaseType, setCurrentPhaseType] = useState('work');
  const [currentPhaseDuration, setCurrentPhaseDuration] = useState(initialSettings.workDuration);

  const normalizedCycleTarget = Math.max(1, cyclesBeforeLongBreak || 1);
  const dividerColor = theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const totalPhaseSeconds = currentPhaseDuration * 60;
  const remainingSeconds = minutes * 60 + seconds;
  const hasProgress = remainingSeconds !== totalPhaseSeconds;
  const phaseLabel = isWorkTime ? 'Time to work' : 'Time to rest';

  const notifyUser = useCallback((title, body) => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    const NotificationAPI = window.Notification;

    if (NotificationAPI.permission === 'granted') {
      new NotificationAPI(title, { body });
    }
  }, []);

  useEffect(() => {
    if (!isActive) return;

    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    const NotificationAPI = window.Notification;
    const permissionKey = 'pomodoroNotificationRequested';
    const alreadyRequested = localStorage.getItem(permissionKey);

    if (NotificationAPI.permission === 'default' && !alreadyRequested) {
      NotificationAPI.requestPermission().then(() => {
        localStorage.setItem(permissionKey, 'true');
      });
    }
  }, [isActive]);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);

            let nextDuration;
            let notificationMessage;
            let nextIsWorkTime;
            let nextPhaseTypeValue;
            let nextCycleCount = cycleCount;

            if (isWorkTime) {
              const completedCycles = cycleCount + 1;
              const reachedLongBreak = completedCycles >= normalizedCycleTarget;
              nextDuration = reachedLongBreak ? longBreakDuration : breakDuration;
              nextIsWorkTime = false;
              nextPhaseTypeValue = reachedLongBreak ? 'longBreak' : 'break';
              nextCycleCount = completedCycles;
            } else {
              nextDuration = workDuration;
              nextIsWorkTime = true;
              nextPhaseTypeValue = 'work';
              if (currentPhaseType === 'longBreak') {
                nextCycleCount = 0;
              }
            }

            notificationMessage = nextIsWorkTime ? 'Time to work' : 'Time to rest';

            setCycleCount(nextCycleCount);
            setMinutes(nextDuration);
            setSeconds(0);
            setIsWorkTime(nextIsWorkTime);
            setCurrentPhaseType(nextPhaseTypeValue);
            setCurrentPhaseDuration(nextDuration);

            if (onWorkTimeChange) {
              onWorkTimeChange(nextIsWorkTime);
            }

            if (onTimerActiveChange) {
              onTimerActiveChange(false);
            }

            notifyUser('Pomodoro Timer', notificationMessage);
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, seconds, minutes, isWorkTime, workDuration, breakDuration, longBreakDuration, cycleCount, normalizedCycleTarget, currentPhaseType, onWorkTimeChange, onTimerActiveChange, notifyUser]);

  useEffect(() => {
    if (onTimerActiveChange) {
      onTimerActiveChange(isActive);
    }
  }, [isActive, onTimerActiveChange]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(workDuration);
    setSeconds(0);
    setIsWorkTime(true);
    setCycleCount(0);
    setCurrentPhaseType('work');
    setCurrentPhaseDuration(workDuration);

    if (onWorkTimeChange) {
      onWorkTimeChange(true);
    }
    if (onTimerActiveChange) {
      onTimerActiveChange(false);
    }
  };

  const skipTimer = () => {
    let nextDuration;
    let notificationMessage;
    let nextIsWorkTime;
    let nextPhaseTypeValue;
    let nextCycleCount = cycleCount;

    if (isWorkTime) {
      const completedCycles = cycleCount + 1;
      const reachedLongBreak = completedCycles >= normalizedCycleTarget;
      nextDuration = reachedLongBreak ? longBreakDuration : breakDuration;
      notificationMessage = 'Time for a break!';
      nextIsWorkTime = false;
      nextPhaseTypeValue = reachedLongBreak ? 'longBreak' : 'break';
      nextCycleCount = completedCycles;
    } else {
      nextDuration = workDuration;
      notificationMessage = 'Back to work!';
      nextIsWorkTime = true;
      nextPhaseTypeValue = 'work';
      if (currentPhaseType === 'longBreak') {
        nextCycleCount = 0;
      }
    }

    setCycleCount(nextCycleCount);
    setMinutes(nextDuration);
    setSeconds(0);
    setIsWorkTime(nextIsWorkTime);
    setCurrentPhaseType(nextPhaseTypeValue);
    setCurrentPhaseDuration(nextDuration);
    setIsActive(true);

    if (onWorkTimeChange) {
      onWorkTimeChange(nextIsWorkTime);
    }

    if (onTimerActiveChange) {
      onTimerActiveChange(true);
    }

    notifyUser('Timer Skipped!', notificationMessage);
  };

  const applySettings = () => {
    if (!isActive) {
      const targetDuration = isWorkTime
        ? workDuration
        : currentPhaseType === 'longBreak'
          ? longBreakDuration
          : breakDuration;

      setMinutes(targetDuration);
      setSeconds(0);
      setCurrentPhaseDuration(targetDuration);
      setExpanded(false);

      const settings = {
        workDuration,
        breakDuration,
        longBreakDuration,
        cyclesBeforeLongBreak
      };
      localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    }
  };

  const renderCycleProgress = () => {
    const totalCycles = normalizedCycleTarget;
    const normalizedCompletedCycles = cycleCount === 0 ? 0 : (cycleCount % totalCycles || totalCycles);
    const displayedCycles = isWorkTime
      ? Math.min(normalizedCompletedCycles + 1, totalCycles)
      : normalizedCompletedCycles;

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' }, gap: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          Cicli
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {Array.from({ length: totalCycles }).map((_, index) => (
            <CircleIcon
              key={index}
              sx={{
                fontSize: '0.85rem',
                color: index < displayedCycles ? 'primary.main' : 'action.disabled'
              }}
            />
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Accordion
          expanded={expanded}
          onChange={(_, isExpanded) => setExpanded(isExpanded)}
          sx={{
            flex: '1 1 280px',
            border: `1px solid ${dividerColor}`,
            borderRadius: 2,
            boxShadow: 'none',
            backgroundColor: 'background.default'
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                gap: { xs: 1, sm: 2 },
                alignItems: { xs: 'stretch', sm: 'center' }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                  Configurazione
                </Typography>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2" color="text.primary">
                    {`${workDuration}′ lavoro · ${breakDuration}′ pausa · ${longBreakDuration}′ lunga`}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                  <Typography variant="body2" color="text.primary">
                    {`${workDuration}′ lavoro · ${breakDuration}′ pausa · ${longBreakDuration}′ lunga`}
                  </Typography>
                </Box>
                {renderCycleProgress()}
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  label="Work Duration (min)"
                  type="number"
                  value={workDuration}
                  onChange={(e) => setWorkDuration(Number(e.target.value))}
                  inputProps={{ min: 1, max: 60 }}
                  sx={{ flex: 1, minWidth: 140 }}
                />
                <TextField
                  label="Break Duration (min)"
                  type="number"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(Number(e.target.value))}
                  inputProps={{ min: 1, max: 30 }}
                  sx={{ flex: 1, minWidth: 140 }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  label="Long Break Duration (min)"
                  type="number"
                  value={longBreakDuration}
                  onChange={(e) => setLongBreakDuration(Number(e.target.value))}
                  inputProps={{ min: 5, max: 60 }}
                  sx={{ flex: 1, minWidth: 140 }}
                />
                <TextField
                  label="Cycles Before Long Break"
                  type="number"
                  value={cyclesBeforeLongBreak}
                  onChange={(e) => setCyclesBeforeLongBreak(Number(e.target.value))}
                  inputProps={{ min: 1, max: 10 }}
                  sx={{ flex: 1, minWidth: 140 }}
                />
              </Box>
              <Button variant="contained" onClick={applySettings} disabled={isActive} sx={{ mt: 1 }}>
                Apply Settings
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>
        {themeToggle && (
          <Box sx={{ flexShrink: 0 }}>
            {themeToggle}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: { xs: 3, md: 6 },
          mt: 4
        }}
      >
        <Box sx={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Chip
            label={phaseLabel}
            color={isWorkTime ? 'primary' : 'secondary'}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
          <Box sx={{ position: 'relative', display: 'inline-flex', mt: 3 }}>
            <AnalogClock remainingSeconds={remainingSeconds} totalSeconds={totalPhaseSeconds} />
            <Typography
              variant="h2"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: { xs: '2.6rem', sm: '3.4rem' },
                fontWeight: 700,
                letterSpacing: 4,
                opacity: isActive ? 1 : 0,
                transition: 'opacity 0.3s ease',
                pointerEvents: 'none'
              }}
            >
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </Typography>
            {!isActive && (
              <Fab
                variant="extended"
                color="primary"
                onClick={toggleTimer}
                aria-label="Avvia o riprendi il timer"
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  minWidth: 200,
                  height: 64,
                  boxShadow: 8
                }}
              >
                <PlayArrowRoundedIcon sx={{ mr: 1 }} />
                {hasProgress ? 'Resume' : 'Start'}
              </Fab>
            )}
          </Box>
        </Box>

        <Stack
          direction={{ xs: 'row', md: 'column' }}
          spacing={2}
          alignItems="center"
          justifyContent="center"
          sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' } }}
        >
          {isActive && (
            <Tooltip title="Pause timer">
              <Fab color="secondary" onClick={toggleTimer} aria-label="Pausa timer">
                <PauseRoundedIcon />
              </Fab>
            </Tooltip>
          )}
          <Tooltip title="Reset timer">
            <Fab
              color="default"
              onClick={resetTimer}
              aria-label="Reset timer"
              sx={{ border: `1px solid ${dividerColor}` }}
            >
              <ReplayIcon />
            </Fab>
          </Tooltip>
          <Tooltip title="Skip session">
            <Fab
              color="default"
              onClick={skipTimer}
              aria-label="Skip session"
              sx={{ border: `1px solid ${dividerColor}` }}
            >
              <SkipNextIcon />
            </Fab>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );
};

export default PomodoroTimer;
