import SwiftUI

/// The Saint Benedict prayer as a reference card: the medal's verses in Latin
/// with their Spanish reading, and what each set of initials stands for.
/// Nothing to complete here — it is only meant to be consulted.
struct BenedictView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Crux Sancti Patris Benedicti")
                        .font(.headline)
                    Text("Cruz del Santo Padre Benito")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }

                ForEach(BenedictPrayer.verses, id: \.latin) { verse in
                    VStack(alignment: .leading, spacing: 1) {
                        Text(verse.latin)
                            .font(.body)
                            .italic()
                        Text(verse.spanish)
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                }

                Divider()

                Text("La medalla")
                    .font(.headline)

                ForEach(BenedictPrayer.initials, id: \.letters) { entry in
                    VStack(alignment: .leading, spacing: 1) {
                        Text(entry.letters)
                            .font(.caption.weight(.bold))
                            .foregroundStyle(Color.accentColor)
                        Text(entry.latin)
                            .font(.caption2)
                            .italic()
                        Text(entry.spanish)
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }

                Text("PAX — Paz, el lema benedictino que corona la medalla.")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .padding(.top, 2)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .navigationBarTitleDisplayMode(.inline)
        .navigationTitle("San Benito")
    }
}

enum BenedictPrayer {
    struct Verse {
        let latin: String
        let spanish: String
    }

    struct Initials {
        let letters: String
        let latin: String
        let spanish: String
    }

    static let verses: [Verse] = [
        Verse(latin: "Crux sacra sit mihi lux.", spanish: "La Cruz Santa sea mi luz."),
        Verse(latin: "Non draco sit mihi dux.", spanish: "Que el dragón no sea mi guía."),
        Verse(latin: "Vade retro, Satana!", spanish: "¡Retrocede, Satanás!"),
        Verse(latin: "Numquam suade mihi vana.", spanish: "Nunca me aconsejes cosas vanas."),
        Verse(latin: "Sunt mala quae libas.", spanish: "Es malo lo que me ofreces."),
        Verse(latin: "Ipse venena bibas.", spanish: "Bebe tú mismo tu veneno."),
    ]

    static let initials: [Initials] = [
        Initials(
            letters: "C S P B",
            latin: "Crux Sancti Patris Benedicti",
            spanish: "Cruz del Santo Padre Benito"
        ),
        Initials(
            letters: "C S S M L",
            latin: "Crux Sacra Sit Mihi Lux",
            spanish: "La Cruz Santa sea mi luz"
        ),
        Initials(
            letters: "N D S M D",
            latin: "Non Draco Sit Mihi Dux",
            spanish: "Que el dragón no sea mi guía"
        ),
        Initials(
            letters: "V R S",
            latin: "Vade Retro Satana",
            spanish: "Retrocede, Satanás"
        ),
        Initials(
            letters: "N S M V",
            latin: "Numquam Suade Mihi Vana",
            spanish: "Nunca me aconsejes cosas vanas"
        ),
        Initials(
            letters: "S M Q L",
            latin: "Sunt Mala Quae Libas",
            spanish: "Es malo lo que me ofreces"
        ),
        Initials(
            letters: "I V B",
            latin: "Ipse Venena Bibas",
            spanish: "Bebe tú mismo tu veneno"
        ),
    ]
}
