// styles/home.styles.js
import { StyleSheet } from "react-native";
import COLORS from "../../constants/colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, 
  },
  header: {
    marginBottom: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "JetBrainsMono-Medium",
    letterSpacing: 0.5,
    color: COLORS.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  bookCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    marginBottom: 20,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bookHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  username: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  bookImageContainer: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: COLORS.border,
  },
  bookImage: {
    width: "100%",
    height: "100%",
  },
  bookDetails: {
    padding: 4,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 8,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  footerLoader: {
    marginVertical: 20,
  },
  card: {
  position: 'relative',     // <- evita overlay entre items
  backgroundColor: '#fff',
  borderRadius: 12,
  overflow: 'hidden',
  marginHorizontal: 16,
  marginBottom: 16,
  // sombras
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 2,
},
cardImage: {
  width: '100%',
  height: 180,              // <- altura explícita (o usa aspectRatio: 16/9)
  // NO position absolute aquí
},
cardBody: {
  padding: 12,
},
cardTitle: {
  fontSize: 16,
  fontWeight: '600',
  marginBottom: 4,
},
cardMeta: {
  fontSize: 12,
  color: '#6b7280',
},
statusPill: {
  alignSelf: "flex-start",
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 999,
  marginTop: 6,
},
statusPillText: {
  fontSize: 12,
  fontWeight: "700",
},
actionRow: {
  flexDirection: "row",
  gap: 10,
  marginTop: 10,
},
actionBtn: {
  flexGrow: 1,
  paddingVertical: 10,
  borderRadius: 10,
  alignItems: "center",
  justifyContent: "center",
},
actionBtnPrimary: {
  backgroundColor: "#2563EB", // azul
},
actionBtnWarn: {
  backgroundColor: "#F59E0B", // naranja
},
actionBtnText: {
  color: "#fff",
  fontWeight: "700",
},
reserveRow: {
  flexDirection: "row",
  gap: 8,
  marginTop: 10,
  flexWrap: "wrap",
},
reserveChip: {
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 999,
  backgroundColor: "#EEF2FF",
  borderWidth: 1,
  borderColor: "#C7D2FE",
},
reserveChipText: {
  fontWeight: "700",
  color: "#3730A3",
},
reportChip: {
  backgroundColor: "#FEF3C7", // amarillo suave
  borderColor: "#F59E0B",
},
reportChipText: {
  color: "#B45309",
},
});

export default styles;