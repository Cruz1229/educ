import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AppSettings from "./AppSettings";

jest.mock("./GameViewer", () => ({
  __esModule: true,
  default: ({ gameId, withRA }) => (
    <div data-testid="game-viewer" data-game-id={gameId} data-with-ra={String(withRA)} />
  ),
}));

jest.mock("../games/Encriptacion/Encriptacion", () => () => null);
jest.mock("../games/BloqCode/BloqCode", () => () => null);
jest.mock("../games/CalculoMental/CalculadoraMental", () => () => null);

describe("AppSettings", () => {
  test("conserva la selección de RA al montar LogicPath", () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/settings",
            state: {
              selectedGame: { id: "Laberinto", name: "LogicPath" },
              selectedPlatforms: ["web"],
              gameDetails: { gameName: "LogicPath" },
              withRA: true,
            },
          },
        ]}
      >
        <Routes>
          <Route path="/settings" element={<AppSettings />} />
        </Routes>
      </MemoryRouter>,
    );

    const viewer = screen.getByTestId("game-viewer");
    expect(viewer).toHaveAttribute("data-game-id", "Laberinto");
    expect(viewer).toHaveAttribute("data-with-ra", "true");
  });
});
