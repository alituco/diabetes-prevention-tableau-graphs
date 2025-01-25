"use client";

import React, { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";

interface TableauDisplayProps {
  src: string;
  description: string;
}

export default function TableauDisplay({ src, description }: TableauDisplayProps) {
  const vizContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!vizContainerRef.current) return;

    const objectElement = document.createElement("object");
    objectElement.className = "tableauViz";
    objectElement.style.display = "none"; // let the JS show it

    objectElement.innerHTML = `
      <param name='host_url' value='https%3A%2F%2Fpublic.tableau.com%2F' />
      <param name='embed_code_version' value='3' />
      <param name='site_root' value='' />
      <param name='tabs' value='no' />
      <param name='toolbar' value='yes' />
      <param name='animate_transition' value='yes'/>
      <param name='display_static_image' value='yes'/>
      <param name='display_spinner' value='yes'/>
      <param name='display_overlay' value='yes'/>
      <param name='display_count' value='yes'/>
      <param name='language' value='en-US'/>
      <param name='filter' value='publish=yes'/>

      <!-- Possibly you'd parse 'src' to fill 'name' or 'static_image' dynamically -->
      <!-- For example: -->
      <param name='name' value='${src}' />
    `;

    vizContainerRef.current.appendChild(objectElement);

    const scriptElement = document.createElement("script");
    scriptElement.src = "https://public.tableau.com/javascripts/api/viz_v1.js";
    objectElement.parentNode?.insertBefore(scriptElement, objectElement);

    const handleResize = () => {
      objectElement.style.width = "100%";
      if (vizContainerRef.current) {
        const containerWidth = vizContainerRef.current.offsetWidth;
        objectElement.style.height = containerWidth * 0.75 + "px";
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      // optionally remove child nodes if you want a clean unmount
    };
  }, [src]);

  return (
    <Box>
      <Box
        ref={vizContainerRef}
        style={{ position: "relative", width: "100%", minHeight: "400px" }}
        className="tableauPlaceholder"
      />

      {/* Analysis / Description Underneath */}
      <Box mt={2}>
        <Typography variant="body1">{description}</Typography>
      </Box>
    </Box>
  );
}
