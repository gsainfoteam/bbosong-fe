package me.gistory.bbosong.liveupdate;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import java.util.HashMap;
import java.util.Map;
import org.junit.Test;

public class LiveUpdateMessageTest {

    private static Map<String, String> data(String... keyValues) {
        Map<String, String> map = new HashMap<>();
        map.put("type", "LIVE_UPDATE");
        map.put("machineUuid", "m1");
        map.put("kind", "DRYER");
        map.put("title", "A동 건조기 3번");
        map.put("state", "RUNNING");
        map.put("updatedAt", "1000");
        for (int i = 0; i < keyValues.length; i += 2) {
            if (keyValues[i + 1] == null) map.remove(keyValues[i]);
            else map.put(keyValues[i], keyValues[i + 1]);
        }

        return map;
    }

    @Test
    public void ignoresOtherMessageTypes() {
        assertNull(LiveUpdateMessage.fromData(data("type", "COMPLETE")));
        assertNull(LiveUpdateMessage.fromData(data("type", null)));
        assertNull(LiveUpdateMessage.fromData(null));
    }

    @Test
    public void requiresMachineUuidAndState() {
        assertNull(LiveUpdateMessage.fromData(data("machineUuid", null)));
        assertNull(LiveUpdateMessage.fromData(data("state", "")));
    }

    @Test
    public void omittedKeysAreNull() {
        LiveUpdateMessage message = LiveUpdateMessage.fromData(data());

        assertNotNull(message);
        assertNull(message.startedAtSeconds);
        assertNull(message.endsAtSeconds);
        assertFalse(message.hasEndsAt());
        assertEquals(-1, message.progressPercent(0));
    }

    @Test
    public void parsesNumbersAndIgnoresMalformedOnes() {
        LiveUpdateMessage message = LiveUpdateMessage.fromData(data("startedAt", "100", "endsAt", "abc"));

        assertEquals(Long.valueOf(100), message.startedAtSeconds);
        assertNull(message.endsAtSeconds);
    }

    @Test
    public void washerHasEndsAtOnlyWhenEntered() {
        assertFalse(LiveUpdateMessage.fromData(data("kind", "WASHER")).hasEndsAt());
        assertTrue(LiveUpdateMessage.fromData(data("kind", "WASHER", "endsAt", "2000")).hasEndsAt());
    }

    @Test
    public void washerWithoutEndsAtIsNeverOverdue() {
        LiveUpdateMessage message = LiveUpdateMessage.fromData(data("kind", "WASHER"));

        assertFalse(message.isOverdue(5_000_000));
        assertEquals(-1, message.progressPercent(5_000_000));
    }

    @Test
    public void washerWithEndsAtHasProgressAndGoesOverdue() {
        LiveUpdateMessage message = LiveUpdateMessage.fromData(
            data("kind", "WASHER", "startedAt", "1000", "endsAt", "2000")
        );

        assertEquals(50, message.progressPercent(1_500_000));
        assertFalse(message.isOverdue(1_999_999));
        assertTrue(message.isOverdue(2_000_000));
    }

    @Test
    public void progressIsClampedBetweenStartAndEnd() {
        LiveUpdateMessage message = LiveUpdateMessage.fromData(data("startedAt", "1000", "endsAt", "2000"));

        assertEquals(0, message.progressPercent(500_000));
        assertEquals(50, message.progressPercent(1_500_000));
        assertEquals(100, message.progressPercent(9_000_000));
    }

    @Test
    public void unknownStartFallsBackToUpdatedAt() {
        LiveUpdateMessage message = LiveUpdateMessage.fromData(data("updatedAt", "1000", "endsAt", "2000"));

        assertEquals(1_000_000, message.startedAtMillis());
        assertEquals(50, message.progressPercent(1_500_000));
    }

    @Test
    public void overdueOnlyAfterEndsAt() {
        LiveUpdateMessage message = LiveUpdateMessage.fromData(data("startedAt", "1000", "endsAt", "2000"));

        assertFalse(message.isOverdue(1_999_999));
        assertTrue(message.isOverdue(2_000_000));
    }

    @Test
    public void finishedStates() {
        assertTrue(LiveUpdateMessage.fromData(data("state", "END")).isFinished());
        assertTrue(LiveUpdateMessage.fromData(data("state", "ERROR")).isFinished());
        assertFalse(LiveUpdateMessage.fromData(data("state", "PAUSE")).isFinished());
    }
}
