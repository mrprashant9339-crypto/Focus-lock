package com.focuslock.app.domain.model

enum class InterventionType(val displayName: String, val description: String) {
    BREATHING("Mindful Breathing", "Take 3 deep, grounding breaths before opening"),
    WAIT_TIMER("30s Patience Pause", "A 30-second delay timer with mindful reflection prompt"),
    INTENTION_CHECK("Intention Check", "Type your conscious intent before proceeding"),
    ROTATE_PHONE("Tactile Orientation", "Rotate your phone 180 degrees to reset automatic scrolling impulse"),
    STRICT_LOCK("Impenetrable Hard Lock", "Complete access denied until current focus window concludes")
}
