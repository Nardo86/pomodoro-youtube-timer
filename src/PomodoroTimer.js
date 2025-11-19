import React, { useState, useEffect } from 'react';
import { Button, Typography, Box, TextField, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CircleIcon from '@mui/icons-material/Circle';

const PomodoroTimer = ({ onWorkTimeChange }) => {
  // Load settings from localStorage on mount
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

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);

            // Determine next duration and update cycle count
            let nextDuration;
            let notificationMessage;
            if (isWorkTime) {
              // Work time just ended
              if (cycleCount + 1 >= cyclesBeforeLongBreak) {
                nextDuration = longBreakDuration;
              } else {
                nextDuration = breakDuration;
              }
              notificationMessage = 'Time for a break!';
            } else {
              // Break time just ended
              nextDuration = workDuration;
              setCycleCount(prev => prev + 1);
              notificationMessage = 'Back to work!';
            }

            setMinutes(nextDuration);
            setIsWorkTime(!isWorkTime);
            setSeconds(0);
            
            // Notify parent component of work time change
            if (onWorkTimeChange) {
              onWorkTimeChange(!isWorkTime);
            }

            // Request notification permission
            if (Notification.permission !== 'granted') {
              Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                  new Notification('Timer Finished!', {
                    body: notificationMessage
                  });
                }
              });
            } else {
              new Notification('Timer Finished!', {
                body: notificationMessage
              });
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, minutes, isWorkTime, workDuration, breakDuration, longBreakDuration, cycleCount, cyclesBeforeLongBreak, onWorkTimeChange]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(workDuration);
    setSeconds(0);
    setIsWorkTime(true);
    setCycleCount(0);
  };

  const skipTimer = () => {
    setIsActive(false);

    // Determine next duration and update cycle count
    let nextDuration;
    let notificationMessage;
    if (isWorkTime) {
      // Work time just ended
      if (cycleCount + 1 >= cyclesBeforeLongBreak) {
        nextDuration = longBreakDuration;
      } else {
        nextDuration = breakDuration;
      }
      notificationMessage = 'Time for a break!';
    } else {
      // Break time just ended
      nextDuration = workDuration;
      setCycleCount(prev => prev + 1);
      notificationMessage = 'Back to work!';
    }

    setMinutes(nextDuration);
    setIsWorkTime(!isWorkTime);
    setSeconds(0);
    
    // Notify parent component of work time change
    if (onWorkTimeChange) {
      onWorkTimeChange(!isWorkTime);
    }

    // Request notification permission
    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Timer Finished!', {
            body: notificationMessage
          });
        }
      });
    } else {
      new Notification('Timer Finished!', {
        body: notificationMessage
      });
    }
  };

  const applySettings = () => {
    if (!isActive) {
      setMinutes(isWorkTime ? workDuration : breakDuration);
      setSeconds(0);
      setExpanded(false); // Collapse the panel after applying settings
      
      // Save settings to localStorage
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
    const totalCycles = cyclesBeforeLongBreak;
    const completedCycles = cycleCount % totalCycles;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {Array.from({ length: totalCycles }).map((_, index) => (
            <CircleIcon
              key={index}
              sx={{
                fontSize: 'small',
                color: index < completedCycles ? 'primary.main' : 'action.disabled'
              }}
            />
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {isWorkTime ? 'Work Time' : 'Break Time'}
      </Typography>
      <Typography variant="h2" gutterBottom>
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
        <Button variant="contained" onClick={toggleTimer} sx={{ mr: 2 }}>
          {isActive ? 'Pause' : 'Start'}
        </Button>
        <Button variant="outlined" onClick={resetTimer} sx={{ mr: 2 }}>
          Reset
        </Button>
        <Button variant="outlined" onClick={skipTimer}>
          Skip
        </Button>
      </Box>

      <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1">
              {`${workDuration} / ${breakDuration}`}
            </Typography>
            {renderCycleProgress()}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Work Duration (min)"
                type="number"
                value={workDuration}
                onChange={(e) => setWorkDuration(Number(e.target.value))}
                inputProps={{ min: 1, max: 60 }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Break Duration (min)"
                type="number"
                value={breakDuration}
                onChange={(e) => setBreakDuration(Number(e.target.value))}
                inputProps={{ min: 1, max: 30 }}
                sx={{ flex: 1 }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Long Break Duration (min)"
                type="number"
                value={longBreakDuration}
                onChange={(e) => setLongBreakDuration(Number(e.target.value))}
                inputProps={{ min: 5, max: 60 }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Cycles Before Long Break"
                type="number"
                value={cyclesBeforeLongBreak}
                onChange={(e) => setCyclesBeforeLongBreak(Number(e.target.value))}
                inputProps={{ min: 1, max: 10 }}
                sx={{ flex: 1 }}
              />
            </Box>
            <Button variant="contained" onClick={applySettings} sx={{ mt: 2 }}>
              Apply Settings
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default PomodoroTimer;