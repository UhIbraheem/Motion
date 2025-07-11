import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Button from './Button';

interface TimingSectionProps {
  startTime: string;
  endTime: string;
  duration: string;
  flexibleTiming: boolean;
  customEndTime: boolean;
  onStartTimeChange: (time: string) => void;
  onDurationChange: (duration: string) => void;
  onFlexibleTimingChange: (flexible: boolean) => void;
  onCustomEndTimeChange: (custom: boolean) => void;
  onEndTimeChange: (time: string) => void;
}

const TimingSection: React.FC<TimingSectionProps> = ({
  startTime,
  endTime,
  duration,
  flexibleTiming,
  customEndTime,
  onStartTimeChange,
  onDurationChange,
  onFlexibleTimingChange,
  onCustomEndTimeChange,
  onEndTimeChange,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  // Time options ordered for 12pm to be in the middle
  const timeOptions = [
    '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  // Duration options
  const durationOptions = [
    { key: 'quick', label: '2 Hours', desc: 'Quick' },
    { key: 'half-day', label: 'Half Day', desc: '4-6 hours' },
    { key: 'full-day', label: 'Full Day', desc: '8+ hours' }
  ];

  // Format time display (24-hour to 12-hour)
  const formatTimeDisplay = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  // Auto-scroll to center on 12pm when component mounts
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        const buttonWidth = 70; // approximate button width
        const twelveIndex = timeOptions.indexOf('12:00');
        const scrollX = (twelveIndex * buttonWidth) - (200); // center it
        scrollViewRef.current?.scrollTo({ x: scrollX, animated: true });
      }, 100);
    }
  }, []);

  return (
    <View className="mb-4">
      {/* Start Time */}
      <View className="mb-3">
        <Text 
          className="text-brand-sage text-sm font-medium mb-2"
          style={{ fontFamily: 'Inter-Medium' }}
        >
          Start Time
        </Text>
        <View className="relative mb-4">
          <ScrollView 
            ref={scrollViewRef}
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mb-4"
          >
            <View className="flex-row px-2">
              {timeOptions.map((time) => (
                <Button
                  key={time}
                  title={formatTimeDisplay(time)}
                  onPress={() => onStartTimeChange(time)}
                  variant="filter-time"
                  size="sm"
                  isSelected={startTime === time}
                />
              ))}
            </View>
          </ScrollView>
          
          {/* Left fade gradient */}
          <LinearGradient
            colors={['#ffffff', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="absolute left-0 top-0 bottom-0 w-12 z-10"
            pointerEvents="none"
          />
          
          {/* Right fade gradient */}
          <LinearGradient
            colors={['rgba(255,255,255,0)', '#ffffff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="absolute right-0 top-0 bottom-0 w-12 z-10"
            pointerEvents="none"
          />
        </View>
      </View>

      {/* Duration with Smart End Time */}
      <View className="mb-3">
        <Text 
          className="text-brand-sage text-sm font-medium mb-2"
          style={{ fontFamily: 'Inter-Medium' }}
        >
          Duration
        </Text>
        <View className="flex-row justify-between mb-2 px-1">
          {durationOptions.map((durationOption) => (
            <Button
              key={durationOption.key}
              title={durationOption.label}
              description={durationOption.desc}
              onPress={() => onDurationChange(durationOption.key)}
              variant="filter-action"
              isSelected={duration === durationOption.key}
              className="flex-1 mx-0.5"
            />
          ))}
        </View>
        
        {/* Smart End Time Display - WITH SOFTER SHADOW */}
        <View className="bg-brand-light rounded-lg p-3" style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        }}>
          <Text className="text-brand-sage text-sm mb-3">
            Ends around: {formatTimeDisplay(endTime)}
          </Text>
          
          {/* Custom End Time Toggle */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <Text className="text-brand-sage text-sm">
                Set custom end time
              </Text>
              <Text className="text-brand-sage text-xs opacity-75">
                Choose your preferred end time
              </Text>
            </View>
            <Switch
              value={customEndTime}
              onValueChange={onCustomEndTimeChange}
              trackColor={{ false: '#E5E5E5', true: '#4d987b' }}
              thumbColor={customEndTime ? '#3c7660' : '#f4f3f4'}
            />
          </View>
          
          {/* Custom End Time Picker */}
          {customEndTime && (
            <View className="mt-2">
              <Text className="text-brand-sage text-xs mb-2">
                Choose end time:
              </Text>
              <View className="relative">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row">
                    {timeOptions.map((time) => (
                      <Button
                        key={time}
                        title={formatTimeDisplay(time)}
                        onPress={() => onEndTimeChange(time)}
                        variant="filter-time"
                        size="sm"
                        isSelected={endTime === time}
                      />
                    ))}
                  </View>
                </ScrollView>
                
                {/* Left fade gradient for end time picker */}
                <LinearGradient
                  colors={['#F9F6F1', 'rgba(249,246,241,0)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="absolute left-0 top-0 bottom-0 w-8 z-10"
                  pointerEvents="none"
                />
                
                {/* Right fade gradient for end time picker */}
                <LinearGradient
                  colors={['rgba(249,246,241,0)', '#F9F6F1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="absolute right-0 top-0 bottom-0 w-8 z-10"
                  pointerEvents="none"
                />
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Flexible Timing Toggle - WITH SOFTER SHADOW */}
      <View className="flex-row items-center justify-between mt-2 px-3 py-3 border border-brand-sage rounded-lg" style={{
        shadowColor: '#3c7660',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2
      }}>
        <View className="flex-1 mr-3">
          <Text className="text-brand-sage text-sm">
            Flexible timing
          </Text>
          <Text className="text-brand-sage text-xs opacity-75">
            Allow ±1 hour flexibility for better recommendations
          </Text>
        </View>
        <Switch
          value={flexibleTiming}
          onValueChange={onFlexibleTimingChange}
          trackColor={{ false: '#E5E5E5', true: '#4d987b' }}
          thumbColor={flexibleTiming ? '#3c7660' : '#f4f3f4'}
        />
      </View>
    </View>
  );
};

export default TimingSection;