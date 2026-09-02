package com.aibugtriage.agent.controller;

import com.aibugtriage.agent.dto.BugResponse;
import com.aibugtriage.agent.dto.BugStatsResponse;
import com.aibugtriage.agent.dto.CreateBugRequest;
import com.aibugtriage.agent.dto.UpdateBugRequest;
import com.aibugtriage.agent.model.Priority;
import com.aibugtriage.agent.model.Status;
import com.aibugtriage.agent.service.BugService;
import com.aibugtriage.agent.service.TriageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BugControllerTest {

    @Mock
    private BugService bugService;

    @Mock
    private TriageService triageService;

    @InjectMocks
    private BugController bugController;

    private BugResponse sampleResponse;

    @BeforeEach
    void setUp() {
        sampleResponse = BugResponse.builder()
                .id(100L)
                .title("Sample Bug")
                .description("Sample description")
                .status(Status.OPEN)
                .priority(Priority.HIGH)
                .reporterUsername("reporter1")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void testCreateBug() {
        CreateBugRequest request = new CreateBugRequest();
        request.setTitle("New Bug");
        request.setDescription("New Bug description");

        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getName()).thenReturn("reporter1");

        when(bugService.createBug(any(CreateBugRequest.class), eq("reporter1"))).thenReturn(sampleResponse);

        ResponseEntity<BugResponse> response = bugController.createBug(request, auth);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Sample Bug", response.getBody().getTitle());
    }

    @Test
    void testTriageBugPrompt() {
        Map<String, String> payload = Map.of("prompt", "User cannot login due to 500 server error");
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getName()).thenReturn("reporter1");

        when(bugService.createBug(any(CreateBugRequest.class), eq("reporter1"))).thenReturn(sampleResponse);

        ResponseEntity<BugResponse> response = bugController.triageBugPrompt(payload, auth);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void testGetBugStats() {
        BugStatsResponse stats = new BugStatsResponse(10, 4, 3, 2, 1, 1);
        when(bugService.getBugStats()).thenReturn(stats);

        ResponseEntity<BugStatsResponse> response = bugController.getBugStats();
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(10, response.getBody().getTotal());
        assertEquals(4, response.getBody().getOpen());
        assertEquals(3, response.getBody().getInProgress());
        assertEquals(2, response.getBody().getResolved());
        assertEquals(1, response.getBody().getClosed());
        assertEquals(1, response.getBody().getCritical());
    }

    @Test
    void testGetAllBugs() {
        when(bugService.getAllBugs(null, null)).thenReturn(List.of(sampleResponse));

        ResponseEntity<List<BugResponse>> response = bugController.getAllBugs(null, null);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void testGetBugById() {
        when(bugService.getBugById(100L)).thenReturn(sampleResponse);

        ResponseEntity<BugResponse> response = bugController.getBugById(100L);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(100L, response.getBody().getId());
    }

    @Test
    void testUpdateBug() {
        UpdateBugRequest req = new UpdateBugRequest();
        req.setStatus(Status.RESOLVED);

        when(bugService.updateBug(eq(100L), any(UpdateBugRequest.class))).thenReturn(sampleResponse);

        ResponseEntity<BugResponse> response = bugController.updateBug(100L, req);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testDeleteBug() {
        doNothing().when(bugService).deleteBug(100L);

        ResponseEntity<String> response = bugController.deleteBug(100L);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Bug deleted successfully", response.getBody());
    }
}
