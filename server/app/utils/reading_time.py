import math

def calculate_reading_minutes(content_length: int) -> int:
    return max(1, math.ceil(content_length / 1100))
