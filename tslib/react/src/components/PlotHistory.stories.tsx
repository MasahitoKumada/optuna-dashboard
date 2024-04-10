import { Meta, StoryObj } from "@storybook/react"
import { useMockStudy } from "../MockStudies"
import { PlotHistory } from "./PlotHistory"
import React from "react"

const meta: Meta<typeof PlotHistory> = {
  component: PlotHistory,
  title: "PlotHistory",
  tags: ["autodocs"],
  decorators: [
    (Story, storyContext) => {
      const study = useMockStudy(storyContext.parameters?.studyId)
      if (!study) return <p>loading...</p>
      return (
        <Story
          args={{
            study,
          }}
        />
      )
    },
  ],
}

export default meta
type Story = StoryObj<typeof PlotHistory>

export const MockStudy1: Story = {
  parameters: {
    studyId: 1,
  },
}
