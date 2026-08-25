"""Genera estadisticas de acierto por pais, hub y anio de nacimiento.

La tabla "attempts" guarda country y birth_year denormalizados en cada
fila, por lo que no hace falta cruzar con "participants" para el
analisis agregado.

Uso:
    pip install supabase pandas
    export SUPABASE_URL=...
    export SUPABASE_SERVICE_ROLE_KEY=...
    python scripts/analyze_results.py
"""

from __future__ import annotations

import os
import sys
from datetime import datetime

import pandas as pd
from supabase import Client, create_client


def get_client() -> Client:
    """Crea el cliente de Supabase usando la service_role key.

    La service_role key nunca debe usarse en el frontend: solo aqui,
    en un script que corre en un entorno de confianza.
    """
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        sys.exit(
            "Faltan las variables de entorno SUPABASE_URL y "
            "SUPABASE_SERVICE_ROLE_KEY."
        )

    return create_client(url, key)


def fetch_attempts(client: Client) -> pd.DataFrame:
    """Descarga todos los intentos ya denormalizados."""
    response = client.table("attempts").select("*").execute()
    df = pd.DataFrame(response.data)

    if df.empty:
        return df

    df["created_at"] = pd.to_datetime(df["created_at"])
    df["age"] = datetime.now().year - df["birth_year"]
    return df


def summarize_by(df: pd.DataFrame, column: str) -> pd.DataFrame:
    """Tasa de acierto agregada por la columna indicada."""
    return (
        df.groupby(column)["correct"]
        .agg(intentos="count", aciertos="sum")
        .assign(tasa_acierto=lambda x: x["aciertos"] / x["intentos"])
        .sort_values("tasa_acierto", ascending=False)
    )


def summarize_by_age_group(df: pd.DataFrame) -> pd.DataFrame:
    """Agrupa por franjas de edad de 10 anios."""
    bins = list(range(0, 110, 10))
    df = df.copy()
    df["age_group"] = pd.cut(df["age"], bins=bins)
    return summarize_by(df, "age_group")


def summarize_over_time(df: pd.DataFrame) -> pd.DataFrame:
    """Tasa de acierto por dia, para ver evolucion en el tiempo."""
    df = df.copy()
    df["date"] = df["created_at"].dt.date
    return summarize_by(df, "date")


def main() -> None:
    client = get_client()
    df = fetch_attempts(client)

    if df.empty:
        print("Todavia no hay datos suficientes.")
        return

    print("\n=== Tasa de acierto por pais ===")
    print(summarize_by(df, "country"))

    print("\n=== Tasa de acierto por hub ===")
    print(summarize_by(df, "hub"))

    print("\n=== Tasa de acierto por fase ===")
    print(summarize_by(df, "phase"))

    print("\n=== Tasa de acierto por franja de edad ===")
    print(summarize_by_age_group(df))

    print("\n=== Tasa de acierto por fecha de envio ===")
    print(summarize_over_time(df))

    output_path = "aiwareness_results.csv"
    df.to_csv(output_path, index=False)
    print(f"\nDatos exportados a {output_path}")


if __name__ == "__main__":
    main()
