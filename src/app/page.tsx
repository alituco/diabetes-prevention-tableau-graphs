"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  styled,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  CircularProgress,
  CssBaseline,
  Divider,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../styles/theme";

// Import your existing TableauEmbed component that loads a single viz
import TableauEmbed from "../components/TableauGraphs";

/** Main Page */
export default function MainPage() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Root>
        {/* Hero / Heading */}
        <Hero>
          <Typography variant="h3" component="h1" gutterBottom>
            Preventative Diabetes & Heart Disease Risk
          </Typography>
          <Typography variant="body1">
            Compare your current risk vs. your future (improved) risk. Emphasize
            healthy diet and lifestyle changes!
          </Typography>
        </Hero>

        {/* BIG VISUALIZATIONS */}
        <VizContainer>
          <SectionCard>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Multiple Heart Disease & Diabetes Visualizations
              </Typography>

              <BigVizRow>
                {/* 1) Heart Disease per 100 (Sex) */}
                <VizBox>
                  <TableauEmbed
                    src="Book1_17376968176560/HeartDiseasecasesper100Sex"
                    description="Males are more likely to get heart disease, potentially because they smoke more frequently. We'll explore smoking patterns later to see if that fully explains the difference."
                  />
                </VizBox>

                {/* 2) Heart Disease per 100 (BMI) */}
                <VizBox>
                  <TableauEmbed
                    src="Book1_17376968176560/HeartDiseaseper100bmi"
                    description="BMI alone doesn't strongly determine heart disease risk, but higher BMI combined with smoking shows a notable increase in heart disease incidence."
                  />
                </VizBox>

                {/* 3) Heart Disease per 100 (smokers vs. non-smokers, male/female) */}
                <VizBox>
                  <TableauEmbed
                    src="Book1_17376968176560/HeartDiseaseper100smokersvsnon-somkersmalefemale"
                    description="Smokers are significantly more likely to develop heart disease than non-smokers, especially among men."
                  />
                </VizBox>

                {/* 4) Diabetes Cases per 100 (Sex) */}
                <VizBox>
                  <TableauEmbed
                    src="Book1_17376968176560/DiabetesCasesper100Sex"
                    description="Men show a higher rate of diabetes cases than women, mirroring some of the trends seen in heart disease."
                  />
                </VizBox>

                {/* 5) Diabetes Cases per 100 for BMI range */}
                <VizBox>
                  <TableauEmbed
                    src="Book1_17376968176560/Diabetescasesper100forBMirange"
                    description="BMI is closely correlated with diabetes risk. Being overweight or obese, combined with smoking, greatly increases the likelihood of diabetes."
                  />
                </VizBox>

                {/* 6) Diabetes Cases per 100 (smokers vs. non-smokers) */}
                <VizBox>
                  <TableauEmbed
                    src="Book1_17376968176560/DiabetesCasesper100smokersvsnon-smokers"
                    description="While not as dramatic as heart disease, smoking still raises diabetes risk, dispelling the myth that smoking only impacts cardiovascular issues."
                  />
                </VizBox>
              </BigVizRow>
            </CardContent>
          </SectionCard>
        </VizContainer>

        {/* CALCULATOR */}
        <CalcContainer>
          <SectionCard>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Current vs. Planned Lifestyles
              </Typography>
              <PreventativeCalculator />
            </CardContent>
          </SectionCard>
        </CalcContainer>
      </Root>
    </ThemeProvider>
  );
}

/* ------------------------------------------------------------------
   PreventativeCalculator (Full Logic & Fields)
------------------------------------------------------------------ */
function PreventativeCalculator() {
  // Current lifestyle
  const [currentLifestyle, setCurrentLifestyle] = useState({
    age: "",
    weight: "",
    smoker: false,
    exerciseLevel: "",
    dietType: "", // 'omnivore', 'vegetarian', 'vegan', 'pescetarian'
    mealsPerDay: "",
    sugaryDrinks: false,
  });

  // Planned changes
  const [plannedLifestyle, setPlannedLifestyle] = useState({
    targetWeight: "",
    smoker: false,
    exerciseLevel: "",
    plannedDietType: "",
    plannedMealsPerDay: "",
    eliminateSugaryDrinks: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [multiplier, setMultiplier] = useState<string | null>(null);
  const [moreOrLess, setMoreOrLess] = useState<string | null>(null);

  /* ---------------------------
   * Handle Current Inputs
   * --------------------------- */
  const handleCurrentChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "checkbox") {
      setCurrentLifestyle((prev) => ({
        ...prev,
        [name as keyof typeof prev]: !prev[name as keyof typeof prev],
      }));
    } else {
      setCurrentLifestyle((prev) => ({ ...prev, [name as string]: value }));
    }
  };

  /* ---------------------------
   * Handle Planned Inputs
   * --------------------------- */
  const handlePlannedChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "checkbox") {
      setPlannedLifestyle((prev) => ({
        ...prev,
        [name as keyof typeof prev]: !prev[name as keyof typeof prev],
      }));
    } else {
      setPlannedLifestyle((prev) => ({ ...prev, [name as string]: value }));
    }
  };

  /* ---------------------------
   * Handle Form Submit
   * --------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMultiplier(null);
    setMoreOrLess(null);

    // Basic validation (currentLifestyle)
    if (
      !currentLifestyle.age ||
      !currentLifestyle.weight ||
      !currentLifestyle.exerciseLevel ||
      !currentLifestyle.dietType ||
      !currentLifestyle.mealsPerDay
    ) {
      setError("Please fill out all required fields for current lifestyle.");
      setLoading(false);
      return;
    }

    // Basic validation (plannedLifestyle)
    if (
      !plannedLifestyle.targetWeight ||
      !plannedLifestyle.exerciseLevel ||
      !plannedLifestyle.plannedDietType ||
      !plannedLifestyle.plannedMealsPerDay
    ) {
      setError("Please fill out all required fields for planned lifestyle.");
      setLoading(false);
      return;
    }

    // If validations pass, call your /api/preventionRisk
    try {
      const response = await fetch("/api/preventionRisk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentLifestyle, plannedLifestyle }),
      });

      const data = await response.json();
      if (response.ok) {
        // e.g. set multiplier & direction
        setMultiplier(data.multiplier);
        setMoreOrLess(data.direction);
      } else {
        setError(data.error || "Error fetching risk comparison.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        mt: 2,
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Typography variant="h6" fontWeight="bold">
        Current Lifestyle
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Age */}
        <TextField
          label="Age"
          name="age"
          type="number"
          value={currentLifestyle.age}
          onChange={handleCurrentChange}
          required
          fullWidth
        />

        {/* Weight */}
        <TextField
          label="Weight (lbs)"
          name="weight"
          type="number"
          value={currentLifestyle.weight}
          onChange={handleCurrentChange}
          required
          fullWidth
        />

        {/* Smoker */}
        <FormControlLabel
          control={
            <Checkbox
              checked={currentLifestyle.smoker}
              onChange={handleCurrentChange}
              name="smoker"
            />
          }
          label="Smoker"
        />

        {/* Exercise Level */}
        <FormControl fullWidth required>
          <FormLabel>Exercise Level</FormLabel>
          <RadioGroup
            row
            name="exerciseLevel"
            value={currentLifestyle.exerciseLevel}
            onChange={handleCurrentChange}
          >
            <FormControlLabel value="none" control={<Radio />} label="None" />
            <FormControlLabel value="light" control={<Radio />} label="Light" />
            <FormControlLabel value="moderate" control={<Radio />} label="Moderate" />
            <FormControlLabel value="heavy" control={<Radio />} label="Heavy" />
          </RadioGroup>
        </FormControl>

        {/* Diet & Eating Habits (Current) */}
        <Typography variant="subtitle1" fontWeight="bold">
          Diet & Eating Habits
        </Typography>
        <FormControl fullWidth required>
          <FormLabel>Diet Type</FormLabel>
          <RadioGroup
            row
            name="dietType"
            value={currentLifestyle.dietType}
            onChange={handleCurrentChange}
          >
            <FormControlLabel value="omnivore" control={<Radio />} label="Omnivore" />
            <FormControlLabel value="vegetarian" control={<Radio />} label="Vegetarian" />
            <FormControlLabel value="vegan" control={<Radio />} label="Vegan" />
            <FormControlLabel value="pescetarian" control={<Radio />} label="Pescetarian" />
          </RadioGroup>
        </FormControl>

        <TextField
          label="Meals per Day"
          name="mealsPerDay"
          type="number"
          value={currentLifestyle.mealsPerDay}
          onChange={handleCurrentChange}
          required
          fullWidth
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={currentLifestyle.sugaryDrinks}
              onChange={handleCurrentChange}
              name="sugaryDrinks"
            />
          }
          label="Consume Sugary Drinks Regularly?"
        />
      </Box>

      <Divider sx={{ my: 1 }} />

      <Typography variant="h6" fontWeight="bold">
        Planned Changes
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Target Weight */}
        <TextField
          label="Target Weight (lbs)"
          name="targetWeight"
          type="number"
          value={plannedLifestyle.targetWeight}
          onChange={handlePlannedChange}
          required
          fullWidth
        />

        {/* Smoker (Planned) */}
        <FormControlLabel
          control={
            <Checkbox
              checked={plannedLifestyle.smoker}
              onChange={handlePlannedChange}
              name="smoker"
            />
          }
          label="Quit Smoking (or remain non-smoker)?"
        />

        {/* Future Exercise */}
        <FormControl required>
          <FormLabel>Future Exercise Level</FormLabel>
          <RadioGroup
            row
            name="exerciseLevel"
            value={plannedLifestyle.exerciseLevel}
            onChange={handlePlannedChange}
          >
            <FormControlLabel value="none" control={<Radio />} label="None" />
            <FormControlLabel value="light" control={<Radio />} label="Light" />
            <FormControlLabel value="moderate" control={<Radio />} label="Moderate" />
            <FormControlLabel value="heavy" control={<Radio />} label="Heavy" />
          </RadioGroup>
        </FormControl>

        {/* Diet & Eating Habits (Planned) */}
        <Typography variant="subtitle1" fontWeight="bold">
          Diet & Eating Habits (Planned)
        </Typography>
        <FormControl fullWidth required>
          <FormLabel>Diet Type</FormLabel>
          <RadioGroup
            row
            name="plannedDietType"
            value={plannedLifestyle.plannedDietType}
            onChange={handlePlannedChange}
          >
            <FormControlLabel value="omnivore" control={<Radio />} label="Omnivore" />
            <FormControlLabel value="vegetarian" control={<Radio />} label="Vegetarian" />
            <FormControlLabel value="vegan" control={<Radio />} label="Vegan" />
            <FormControlLabel value="pescetarian" control={<Radio />} label="Pescetarian" />
          </RadioGroup>
        </FormControl>

        <TextField
          label="Meals per Day"
          name="plannedMealsPerDay"
          type="number"
          value={plannedLifestyle.plannedMealsPerDay}
          onChange={handlePlannedChange}
          required
          fullWidth
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={plannedLifestyle.eliminateSugaryDrinks}
              onChange={handlePlannedChange}
              name="eliminateSugaryDrinks"
            />
          }
          label="Eliminate Sugary Drinks?"
        />
      </Box>

      {/* Submit Button */}
      <Button variant="contained" color="primary" type="submit" size="large" disabled={loading}>
        {loading ? <CircularProgress size={24} /> : "Compare Risk"}
      </Button>

      {/* Error */}
      {error && (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      )}

      {/* Results */}
      {multiplier && moreOrLess && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            border: "1px solid",
            borderColor: "grey.300",
            borderRadius: 2,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            gap: 2,
            backgroundColor: "grey.50",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography>
              {`You are ${multiplier} times ${moreOrLess} likely to get diabetes`}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}

/* ------------------------------------------------------------------
   STYLED COMPONENTS
------------------------------------------------------------------ */

/** The entire page root */
const Root = styled(Box)(() => ({
  width: "100%",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  overflowX: "hidden",
}));

/** Hero / top area. */
const Hero = styled(Box)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(8, 2),
  textAlign: "center",
}));

/** Container for big row of visualizations. */
const VizContainer = styled(Box)(() => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

/** A card row that has 6 items in a wrap. */
const BigVizRow = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
  width: "100%",
  justifyContent: "center",
}));

/** Each visualization box is about 30% wide on large, 
    minWidth 400, wrapping on smaller screens. */
const VizBox = styled(Box)(({ theme }) => ({
  flex: "1 1 30%",
  minWidth: 400,
  [theme.breakpoints.down("md")]: {
    flex: "1 1 100%",
    minWidth: "auto",
  },
}));

/** For the calculator container. */
const CalcContainer = styled(Box)(() => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "1rem",
}));

/** Reusable card style. */
const SectionCard = styled(Card)(({ theme }) => ({
  width: "90%", 
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  borderRadius: theme.spacing(1),
  boxShadow: theme.shadows[3],
}));
