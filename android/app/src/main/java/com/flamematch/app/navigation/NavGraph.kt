package com.flamematch.app.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.flamematch.app.ui.screens.CashierScreen
import com.flamematch.app.ui.screens.HandHistoryScreen
import com.flamematch.app.ui.screens.LobbyScreen
import com.flamematch.app.ui.screens.ProfileScreen
import com.flamematch.app.ui.screens.TableScreen
import com.flamematch.app.viewmodel.CashierViewModel
import com.flamematch.app.viewmodel.LobbyViewModel
import com.flamematch.app.viewmodel.TableViewModel

sealed class Screen(val route: String) {
    data object Lobby : Screen("Lobby")
    data object Table : Screen("Table/{tableId}") {
        fun create(tableId: String) = "Table/$tableId"
    }
    data object HandHistory : Screen("HandHistory")
    data object Profile : Screen("Profile")
    data object Cashier : Screen("Cashier")
}

@Composable
fun NavGraph(navController: NavHostController) {
    val lobbyViewModel: LobbyViewModel = viewModel()
    val tableViewModel: TableViewModel = viewModel()
    val cashierViewModel: CashierViewModel = viewModel()

    val tables by lobbyViewModel.tables.collectAsState()
    val wallet by cashierViewModel.wallet.collectAsState()
    val hands by cashierViewModel.handHistory.collectAsState()
    val stats by cashierViewModel.userStats.collectAsState()

    NavHost(navController = navController, startDestination = Screen.Lobby.route) {
        composable(Screen.Lobby.route) {
            LobbyScreen(
                selectedStake = lobbyViewModel.selectedStake,
                tables = tables,
                onSelectStake = lobbyViewModel::selectStake,
                onNavigateToTable = { navController.navigate(Screen.Table.create(it.tableId)) },
                onNavigateToCashier = { navController.navigate(Screen.Cashier.route) },
                onNavigateToHistory = { navController.navigate(Screen.HandHistory.route) },
                onNavigateToProfile = { navController.navigate(Screen.Profile.route) }
            )
        }

        composable(
            route = Screen.Table.route,
            arguments = listOf(navArgument("tableId") { defaultValue = "" })
        ) { backStackEntry ->
            val tableId = backStackEntry.arguments?.getString("tableId").orEmpty()
            TableScreen(
                table = tableViewModel.tableById(tableId),
                chipsOnTable = wallet.chipsOnTable,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.HandHistory.route) {
            HandHistoryScreen(hands = hands, onNavigateBack = { navController.popBackStack() })
        }

        composable(Screen.Profile.route) {
            ProfileScreen(user = stats, wallet = wallet, onNavigateBack = { navController.popBackStack() })
        }

        composable(Screen.Cashier.route) {
            CashierScreen(
                wallet = wallet,
                onDeposit = cashierViewModel::deposit,
                onWithdraw = cashierViewModel::withdraw,
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}
