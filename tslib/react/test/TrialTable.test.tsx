import * as Optuna from "@optuna/types"
import { render, screen } from "@testing-library/react"
import React from "react"
import { describe, expect, test } from "vitest"
import { TrialTable } from "../src/components/TrialTable"

describe("TrialTable Tests", async () => {
  const setup = ({
    study,
    dataTestId,
  }: { study: Optuna.Study; dataTestId: string }) => {
    const Wrapper = ({
      dataTestId,
      children,
    }: {
      dataTestId: string
      children: React.ReactNode
    }) => <div data-testid={dataTestId}>{children}</div>
    return render(
      <Wrapper dataTestId={dataTestId}>
        <TrialTable study={study} />
      </Wrapper>
    )
  }

  for (const study of window.mockStudies) {
    test(`TrialTable (study name: ${study.name})`, () => {
      setup({ study, dataTestId: `trial-table-${study.id}` })
      expect(screen.getByTestId(`trial-table-${study.id}`)).toBeInTheDocument()
    })
  }
})
