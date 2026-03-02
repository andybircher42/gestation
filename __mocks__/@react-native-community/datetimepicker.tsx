import { View, Text } from "react-native";

const MockPicker = (props: {
  onChange?: (event: unknown, date?: Date) => void;
  value: Date;
}) => (
  <View testID="date-picker">
    <Text
      testID="date-picker-trigger"
      onPress={() => props.onChange?.({}, new Date(2026, 5, 15))}
    >
      MockDatePicker
    </Text>
  </View>
);
MockPicker.displayName = "MockDateTimePicker";

export default MockPicker;
