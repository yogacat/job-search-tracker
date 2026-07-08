package org.olena.jobsearchtracker.common.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.webmvc.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

// The frontend is a single-page app bundled as static resources (see Dockerfile). Spring's
// static handler only knows real files, so a hard refresh on a client-side route like
// /statistics 404s instead of letting React Router take over. Any unmatched non-API path here
// is such a route -- forward it to index.html; unmatched /api/** paths stay a real 404.
@Controller
public class SpaController implements ErrorController {

    @RequestMapping("/error")
    public Object handleError(HttpServletRequest request, HttpServletResponse response) {
        Object path = request.getAttribute("jakarta.servlet.error.request_uri");
        if (path != null && path.toString().startsWith("/api/")) {
            return ResponseEntity.notFound().build();
        }
        response.setStatus(HttpStatus.OK.value());
        return "forward:/index.html";
    }
}
