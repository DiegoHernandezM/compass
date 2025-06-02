import React from "react";
import styled from "@emotion/styled";
import { rgba } from "polished";
import PropTypes from "prop-types";

import { Box, Container, Grid, Typography } from "@mui/material";
import { spacing } from "@mui/system";

import { ArrowForward as ArrowForwardIcon } from "@mui/icons-material";
import {
  PlusCircle as PlusCircleIcon,
  Book,
  Search,
  List,
} from "react-feather";

Features.propTypes = {
  content: PropTypes.object
};

const Wrapper = styled.div`
  ${spacing};
  background: ${(props) => props.theme.palette.background.paper};
  text-align: center;
`;

const FeatureWrapper = styled.div`
  display: flex;
  text-align: left;
  padding: 18px 20px;
`;

const FeatureIcon = styled.div`
  svg {
    flex-shrink: 0;
    width: auto;
    height: 48px;
    width: 48px;
    background: ${(props) => rgba(props.theme.palette.primary.main, 0.15)};
    color: ${(props) => props.theme.palette.primary.main};
    padding: 10px;
    border-radius: 50%;
  }
`;

const Feature = ({ Icon, title, description }) => {
  return (
    <Grid item xs={12} sm={6} md={3} lg={3}>
      <FeatureWrapper>
        <FeatureIcon>
          <Icon color="white" />
        </FeatureIcon>
        <Box ml={6}>
          <Typography variant="h4" gutterBottom>
            {title}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {description}
          </Typography>
        </Box>
      </FeatureWrapper>
    </Grid>
  );
};

export default function Features({ content }) {
  return (
    <Wrapper py={20} style={{ backgroundColor: "#203764", color: "white" }}>
      <Container>
        <Typography variant="h2" component="h3" gutterBottom>
          {content.footer_title}
        </Typography>
        <Box mb={12} />
        <Grid container spacing={4}>
          <Feature
            Icon={Book}
            title={content.footer_text_1}
            description=""
          />
          <Feature
            Icon={PlusCircleIcon}
            title={content.footer_text_2}
            description=""
          />
          <Feature
            Icon={Search}
            title={content.footer_text_3}
            description=""
          />
          <Feature
            Icon={List}
            title={content.footer_text_4}
            description=""
          />
        </Grid>

      </Container>
    </Wrapper>
  );
}
