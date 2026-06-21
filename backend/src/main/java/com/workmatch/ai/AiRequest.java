package com.workmatch.ai;

import java.util.List;
import java.util.Map;

public record AiRequest(List<Map<String, String>> messages) {}
